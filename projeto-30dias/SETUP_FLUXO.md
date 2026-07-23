# ⚙️ Guia de Configuração — Fluxo WhatsApp Automático

## O que foi adicionado

```
api/
├── incoming.js          ← NOVO: recebe mensagens dos leads
├── flow/
│   ├── messages.js      ← NOVO: todas as mensagens M1-M21
│   ├── engine.js        ← NOVO: motor de fluxo (máquina de estados)
│   ├── db.js            ← NOVO: Supabase (guardar estado dos leads)
│   └── zapi.js          ← NOVO: helpers Z-API
```

---

## PASSO 1 — Criar base de dados Supabase (5 minutos)

### 1.1 Criar conta gratuita
1. Acede a **[supabase.com](https://supabase.com)**
2. Clica em **"Start your project"** → Sign in com GitHub ou email
3. Clica em **"New Project"**
   - Nome: `30-dias-leads`
   - Password: gera uma forte (guarda em segurança)
   - Região: **West EU (Ireland)** (mais próximo de Angola)
4. Aguarda ~2 minutos enquanto o projecto é criado

### 1.2 Criar a tabela de leads
1. No painel Supabase, clica em **"SQL Editor"** (ícone de terminal no menu esquerdo)
2. Clica em **"New Query"**
3. Cola e executa este SQL:

```sql
-- Tabela de estado dos leads no funil de vendas
CREATE TABLE IF NOT EXISTS lead_states (
  phone       TEXT        PRIMARY KEY,
  name        TEXT        DEFAULT '',
  step        TEXT        NOT NULL DEFAULT 'NEW',
  data        JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas por step (útil para métricas)
CREATE INDEX IF NOT EXISTS idx_lead_states_step ON lead_states(step);

-- Função para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger que chama a função acima
DROP TRIGGER IF EXISTS update_lead_states_updated_at ON lead_states;
CREATE TRIGGER update_lead_states_updated_at
  BEFORE UPDATE ON lead_states
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

4. Clica em **"Run"** — deves ver `Success. No rows returned`

### 1.3 Obter as credenciais
1. No painel Supabase, clica em **"Settings"** (ícone de engrenagem) → **"API"**
2. Copia os seguintes valores:
   - **Project URL** → é o teu `SUPABASE_URL`
   - **anon / public key** → é o teu `SUPABASE_ANON_KEY`

---

## PASSO 2 — Adicionar variáveis de ambiente no Vercel

### No terminal (método rápido):
```bash
cd "C:\Users\dell\Documents\paginas 30 dias\projeto-30dias"

vercel env add SUPABASE_URL
# Cola o Project URL do Supabase

vercel env add SUPABASE_ANON_KEY
# Cola o anon/public key do Supabase

vercel env add AGENT_NAME
# Escreve o nome do agente, ex: Marta
```

### Ou pelo dashboard Vercel:
1. Vai a **vercel.com/dashboard** → o teu projecto
2. **Settings → Environment Variables**
3. Adiciona cada variável para **Production + Preview + Development**

### Todas as variáveis necessárias:

| Variável | Valor |
|---|---|
| `ZAPI_INSTANCE_ID` | ID da instância Z-API |
| `ZAPI_TOKEN` | Token Z-API |
| `ZAPI_CLIENT_TOKEN` | Client-Token Z-API (opcional) |
| `SUPABASE_URL` | URL do projecto Supabase |
| `SUPABASE_ANON_KEY` | Chave anon Supabase |
| `ACCESS_LINK` | `https://kiki.ao/6epe2gem` |
| `AGENT_NAME` | Nome do agente (ex: `Marta`) |
| `WA_VERIFY_TOKEN` | Token de verificação webhook |
| `LINK_PLANILHA` | Link da planilha (ou deixar vazio = usa ACCESS_LINK) |
| `LINK_KIXIKILA` | Link do guia kixikila (ou deixar vazio) |
| `LINK_FRASES` | Link das 30 frases (ou deixar vazio) |
| `LINK_GRUPO` | Link do grupo WhatsApp (ou deixar vazio) |

---

## PASSO 3 — Fazer deploy

```bash
cd "C:\Users\dell\Documents\paginas 30 dias\projeto-30dias"
vercel --prod
```

---

## PASSO 4 — Configurar webhook na Z-API

1. Acede ao painel da Z-API
2. Vai à tua instância → **Webhooks** (ou "Configurações")
3. No campo **"Webhook de Recebimento"** (On Message Received), coloca:

```
https://teu-dominio.vercel.app/api/incoming
```

4. Salva a configuração

> ✅ A partir deste momento, cada mensagem que um lead enviar ao teu número de WhatsApp vai ser processada automaticamente pelo fluxo de vendas.

---

## PASSO 5 — Verificar que está tudo a funcionar

```bash
# 1. Verificar todas as variáveis e conectividade Supabase
curl https://teu-dominio.vercel.app/api/health

# Deves receber:
# { "status": "ok", "supabase": "connected", ... }
```

```bash
# 2. Simular um lead a contactar pela primeira vez
curl -X POST https://teu-dominio.vercel.app/api/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "244951257125",
    "senderName": "Teste",
    "fromMe": false,
    "isGroup": false,
    "type": "ReceivedCallback",
    "text": { "message": "olá" }
  }'

# Deves receber M1 no WhatsApp do número de teste
```

```bash
# 3. Ver o estado do lead na Supabase
# No painel Supabase → Table Editor → lead_states
# Deves ver o lead com step = "M1_SENT"
```

---

## 📊 Ver métricas dos leads

No painel **Supabase → Table Editor → lead_states** podes ver:
- Todos os leads e em que fase estão
- Quando entraram (`created_at`) e quando responderam por último (`updated_at`)
- Que objecções levantaram (`data` → `objections`)

### Consultas SQL úteis:

```sql
-- Quantos leads em cada fase
SELECT step, COUNT(*) as total
FROM lead_states
GROUP BY step
ORDER BY total DESC;

-- Leads que chegaram à fase de pagamento
SELECT phone, name, created_at, updated_at
FROM lead_states
WHERE step IN ('M11_SENT', 'PURCHASED')
ORDER BY updated_at DESC;

-- Taxa de conversão
SELECT
  COUNT(*) FILTER (WHERE step = 'PURCHASED') as compraram,
  COUNT(*) FILTER (WHERE step NOT IN ('NEW')) as leads_activos,
  ROUND(
    COUNT(*) FILTER (WHERE step = 'PURCHASED') * 100.0 /
    NULLIF(COUNT(*) FILTER (WHERE step NOT IN ('NEW')), 0), 1
  ) as taxa_conversao_pct
FROM lead_states;
```

---

## 🔄 Acções Manuais do Agente

O bot responde automaticamente. Mas algumas acções são feitas manualmente:

### Enviar follow-up de pós-compra (M13-M17):
```bash
# Usar o endpoint existente /api/whatsapp para enviar M13 manualmente
curl -X POST https://teu-dominio.vercel.app/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{ "customer": { "phone": "951257125", "name": "João" } }'
```

### Reactivar leads inactivos:
No painel Supabase, identifica leads em `NURTURING` ou `M5_SENT` há mais de 3 dias e usa o endpoint acima para os contactar com M19/M20.

---

## ✅ Checklist Final

- [ ] Tabela `lead_states` criada no Supabase
- [ ] `SUPABASE_URL` e `SUPABASE_ANON_KEY` adicionadas no Vercel
- [ ] `AGENT_NAME` definido (nome do agente humano)
- [ ] `vercel --prod` executado com sucesso
- [ ] `/api/health` retorna `"status": "ok"` e `"supabase": "connected"`
- [ ] Webhook Z-API configurado para `/api/incoming`
- [ ] Teste com número real confirmado (M1 chegou ao WhatsApp)
- [ ] Links dos bónus configurados (LINK_PLANILHA, LINK_KIXIKILA, etc.)

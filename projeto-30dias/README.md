# 30 Dias Sem Desculpas — Deploy Guide

Landing page de vendas + integração WhatsApp Business API + deploy Vercel.

---

## 📁 Estrutura do Projecto

```
/
├── index.html          ← Landing page completa
├── vercel.json         ← Configuração Vercel
├── api/
│   ├── whatsapp.js     ← Webhook WhatsApp (envia link após pagamento)
│   └── health.js       ← Health check das variáveis de ambiente
└── README.md
```

---

## 🚀 PASSO 1 — Deploy no Vercel

### 1.1 Criar conta e instalar CLI

```bash
npm install -g vercel
vercel login
```

### 1.2 Fazer deploy a partir desta pasta

```bash
cd projeto-30dias
vercel
```

Segue as instruções no terminal:
- **Project name:** `30-dias-sem-desculpas` (ou o nome que quiseres)
- **Framework:** Other
- **Root directory:** `./` (pasta actual)

### 1.3 Deploy de produção

```bash
vercel --prod
```

O Vercel vai dar-te um URL como: `https://30-dias-sem-desculpas.vercel.app`

---

## 🌐 PASSO 2 — Ligar o teu domínio próprio

### No dashboard do Vercel:
1. Entra em **vercel.com/dashboard**
2. Abre o teu projecto → **Settings → Domains**
3. Adiciona o teu domínio (ex: `metodo30dias.ao` ou `30diasaogola.com`)
4. O Vercel vai mostrar os **DNS records** a configurar

### No painel do teu registrador de domínio:
Adiciona os registos DNS que o Vercel indicar. Exemplo:

| Tipo  | Nome | Valor                          |
|-------|------|-------------------------------|
| A     | @    | 76.76.21.21                   |
| CNAME | www  | cname.vercel-dns.com           |

> ⏳ A propagação DNS pode demorar até 24h (normalmente menos de 1h).

---

## 📱 PASSO 3 — Configurar WhatsApp Business API

### 3.1 Criar conta Meta for Developers

1. Acede a **developers.facebook.com**
2. Cria uma app → tipo **Business**
3. Adiciona o produto **WhatsApp**
4. Vai a **WhatsApp → API Setup**

### 3.2 Obter as credenciais necessárias

| Variável         | Onde encontrar                                      |
|-----------------|-----------------------------------------------------|
| `WA_TOKEN`      | Meta for Developers → WhatsApp → API Setup → Token de acesso temporário (depois gera permanente) |
| `WA_PHONE_ID`   | Meta for Developers → WhatsApp → API Setup → Phone Number ID |
| `WA_VERIFY_TOKEN` | Defines tu mesmo — qualquer string secreta (ex: `angola30dias2026`) |

### 3.3 Adicionar variáveis de ambiente no Vercel

```bash
vercel env add WA_TOKEN
vercel env add WA_PHONE_ID
vercel env add WA_VERIFY_TOKEN
vercel env add ACCESS_LINK
```

Ou pelo dashboard: **Settings → Environment Variables**

Valores:
```
WA_TOKEN        = EAAxxxxxxxxxxxxxxxx (token Meta)
WA_PHONE_ID     = 1234567890123456 (ID do número)
WA_VERIFY_TOKEN = angola30dias2026 (defines tu)
ACCESS_LINK     = https://pay.kursinha.com/c/6a2336a0d0cbc8fc6e870bb2
```

### 3.4 Registar o Webhook no Meta

1. No Meta for Developers → WhatsApp → Configuration → **Webhook**
2. **Callback URL:** `https://teu-dominio.com/api/whatsapp`
3. **Verify Token:** o mesmo valor que colocaste em `WA_VERIFY_TOKEN`
4. Clica **Verify and Save**

> ✅ Confirma que funciona: `GET https://teu-dominio.com/api/health`

---

## 📊 PASSO 3.5 — API de Conversões do Meta (CAPI)

O Pixel (navegador) já está no `index.html`. A **API de Conversões** envia os
mesmos eventos pelo **servidor**, recuperando os que o navegador perde. Os dois
lados usam o **mesmo `event_id`**, por isso o Meta **deduplica** (não conta a dobrar).

Eventos enviados: **PageView**, **InitiateCheckout** (navegador → `/api/capi`) e
**Purchase** (a partir do webhook de pagamento em `api/whatsapp.js`).

### Variáveis de ambiente (adicionar no Vercel)

```bash
vercel env add META_PIXEL_ID     # 1536891164848719 (opcional — já é o valor por omissão)
vercel env add META_CAPI_TOKEN   # token da API de Conversões (SECRETO)
```

| Variável          | Onde encontrar                                                        |
|-------------------|----------------------------------------------------------------------|
| `META_PIXEL_ID`   | Events Manager → o teu conjunto de dados → ID (já é `1536891164848719` no código) |
| `META_CAPI_TOKEN` | Events Manager → Definições → **API de Conversões → Gerar token de acesso** |

> ⚠️ **Nunca** ponhas o token no código nem no HTML — só em variável de ambiente.
> Para testar, cria também `META_TEST_EVENT_CODE` (Events Manager → **Testar eventos**).

### Confirmar que funciona

1. `curl https://teu-dominio.com/api/health` → deve mostrar `META_PIXEL_ID: true` e `META_CAPI_TOKEN: true`.
2. Events Manager → **Testar eventos** → abre a página e clica em comprar → devem aparecer os eventos com origem **Servidor** e **Navegador**, marcados como *deduplicados*.

---

## 🔗 PASSO 4 — Ligar a plataforma de pagamento

Na plataforma onde está o teu produto (Kursinha ou outra), configura o **webhook de compra** para:

```
POST https://teu-dominio.com/api/whatsapp
```

O webhook vai ser chamado sempre que alguém compra. A função envia automaticamente o link de acesso por WhatsApp ao comprador.

### Campos esperados no payload:
```json
{
  "customer": {
    "phone": "951257125",
    "name": "João Silva"
  }
}
```

> Se a tua plataforma usa campos diferentes, edita `api/whatsapp.js` — a secção `ADAPTAR AQUI` indica onde fazer a mudança.

---

## ✅ Verificação final

```bash
# Verificar variáveis de ambiente
curl https://teu-dominio.com/api/health

# Testar envio manual de mensagem
curl -X POST https://teu-dominio.com/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"customer": {"phone": "951257125", "name": "Teste"}}'
```

---

## 📋 Checklist antes de ir ao ar

- [ ] `vercel --prod` executado com sucesso
- [ ] Domínio próprio configurado e a funcionar
- [ ] Variáveis de ambiente todas preenchidas no Vercel
- [ ] Webhook Meta verificado (GET /api/whatsapp responde ao challenge)
- [ ] Webhook de pagamento configurado na plataforma de venda
- [ ] Teste de compra real confirmado (mensagem chegou no WhatsApp)
- [ ] Depoimentos reais substituídos na index.html
- [ ] Pixel Meta instalado na index.html
- [ ] API de Conversões: `META_PIXEL_ID` e `META_CAPI_TOKEN` no Vercel
- [ ] Eventos deduplicados confirmados no "Testar eventos" do Events Manager
- [ ] Google Analytics 4 instalado na index.html

---

## 📞 Suporte

Dúvidas técnicas? WhatsApp: **951 257 125**

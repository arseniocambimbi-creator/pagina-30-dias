/**
 * Z-API WhatsApp — Serverless Function (Vercel)
 *
 * Endpoint: /api/whatsapp
 *   GET  → Verificação de webhook (compatibilidade genérica)
 *   POST → Recebe confirmação de pagamento e envia mensagem WhatsApp via Z-API
 *
 * Variáveis de ambiente no Vercel:
 *   ZAPI_INSTANCE_ID  → ID da instância Z-API
 *   ZAPI_TOKEN        → Token da instância Z-API
 *   ZAPI_CLIENT_TOKEN → Client-Token de segurança Z-API (opcional mas recomendado)
 *   WA_VERIFY_TOKEN   → Token de verificação do webhook (defines tu)
 *   ACCESS_LINK       → Link do produto
 *   META_PIXEL_ID / META_CAPI_TOKEN → API de Conversões (evento Purchase)
 */

import { sendMetaEvent } from '../lib/meta-capi.js';

const ZAPI_INSTANCE_ID  = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN        = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN || '';
const WA_VERIFY_TOKEN   = process.env.WA_VERIFY_TOKEN;
const ACCESS_LINK       = process.env.ACCESS_LINK || 'https://kiki.ao/6epe2gem';

// ── MENSAGEM ENVIADA AO COMPRADOR ────────────────────────────────
function buildMessage(name) {
  return [
    `Olá${name ? ' ' + name : ''}! 🎉`,
    '',
    `O teu pagamento foi confirmado. Aqui está o teu acesso ao *Método dos 30 Dias Sem Desculpas*:`,
    '',
    `👉 ${ACCESS_LINK}`,
    '',
    `📌 Guarda este link — é o teu acesso pessoal.`,
    `❓ Tens dúvidas? Responde a esta mensagem.`,
    '',
    `Bom proveito e boas poupanças! 💚`,
    `— Equipa 30 Dias Sem Desculpas`
  ].join('\n');
}

// ── ENVIAR MENSAGEM VIA Z-API ────────────────────────────────────
async function sendMessage(phone, text) {
  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (ZAPI_CLIENT_TOKEN) {
    headers['Client-Token'] = ZAPI_CLIENT_TOKEN;
  }

  const body = {
    phone: phone,   // ex: "244951257125" (com código do país, sem +)
    message: text
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ── NORMALIZAR NÚMERO DE TELEFONE ────────────────────────────────
// Garante formato internacional sem "+" ou espaços (ex: 244951257125)
function normalizePhone(phone) {
  let p = String(phone).replace(/\D/g, '');
  // Se número angolano de 9 dígitos, adiciona 244
  if (!p.startsWith('244') && p.length === 9) p = '244' + p;
  return p;
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────────────
export default async function handler(req, res) {

  // ── GET: Verificação de webhook genérico ──
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
      console.log('[ZAPI] Webhook verificado');
      return res.status(200).send(challenge);
    }

    // Health check simples
    return res.status(200).json({
      status: 'online',
      zapi_instance: !!ZAPI_INSTANCE_ID,
      zapi_token: !!ZAPI_TOKEN,
      access_link: ACCESS_LINK
    });
  }

  // ── POST: Receber confirmação de pagamento ──
  if (req.method === 'POST') {
    try {
      const payload = req.body;

      // Adapta conforme a plataforma de pagamento:
      // kursinha / Multicaixa: payload.customer.phone ou payload.phone
      // Hotmart / Kiwify:     payload.data.buyer.phone
      const phone = payload?.customer?.phone
                 || payload?.phone
                 || payload?.data?.buyer?.phone
                 || payload?.buyer_phone;

      const name  = payload?.customer?.name
                 || payload?.name
                 || payload?.data?.buyer?.name
                 || payload?.buyer_name
                 || '';

      if (!phone) {
        console.warn('[ZAPI] Número não encontrado no payload:', JSON.stringify(payload));
        return res.status(400).json({ error: 'Número de telefone não encontrado no payload' });
      }

      const to      = normalizePhone(phone);
      const message = buildMessage(name);

      console.log(`[ZAPI] Enviando mensagem para ${to} (${name || 'sem nome'})`);
      const result = await sendMessage(to, message);
      console.log('[ZAPI] Resposta Z-API:', JSON.stringify(result));

      // ── API de Conversões: evento Purchase (compra confirmada) ──
      // Não bloqueia o envio da mensagem se falhar.
      const email = payload?.customer?.email || payload?.email || payload?.data?.buyer?.email;
      const value = Number(
        payload?.value ?? payload?.amount ?? payload?.data?.purchase?.price?.value ?? 2500
      );
      const currency = payload?.currency || payload?.data?.purchase?.price?.currency_value || 'AOA';
      const eventId  = payload?.order_id || payload?.transaction_id || payload?.id || `purchase_${to}_${Date.now()}`;

      try {
        await sendMetaEvent({
          eventName:   'Purchase',
          eventId:     String(eventId),
          actionSource: 'website',
          userData:    { phone: to, email },
          customData:  { value, currency, content_name: 'Método 30 Dias Sem Desculpas' },
        });
      } catch (capiErr) {
        console.error('[CAPI] Purchase falhou:', capiErr.message);
      }

      return res.status(200).json({ success: true, zapiResponse: result });

    } catch (err) {
      console.error('[ZAPI] Erro:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}

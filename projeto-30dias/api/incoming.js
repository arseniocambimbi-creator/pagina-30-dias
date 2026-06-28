/**
 * /api/incoming — Receber mensagens WhatsApp via Z-API
 *
 * Configurar este URL no painel Z-API como Webhook de entrada:
 *   https://teu-dominio.com/api/incoming
 *
 * Payload Z-API (mensagem recebida):
 * {
 *   "phone":      "244951257125",
 *   "senderName": "João Silva",
 *   "fromMe":     false,
 *   "isGroup":    false,
 *   "type":       "ReceivedCallback",
 *   "text":       { "message": "1" },     // mensagem de texto
 *   "image":      { ... },                // se for imagem
 *   "document":   { ... },                // se for documento
 * }
 */

import { getLeadState, createLeadState, setLeadState, updateLeadName } from './flow/db.js';
import { normalizePhone, sendMessages }                                 from './flow/zapi.js';
import { processMessage }                                               from './flow/engine.js';

export default async function handler(req, res) {
  // Aceitar só POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const payload = req.body;

  // ── Filtros de segurança ───────────────────────────────────────────────────
  // Ignorar mensagens enviadas por nós mesmos
  if (payload.fromMe === true) {
    return res.status(200).json({ ignored: 'fromMe' });
  }

  // Ignorar mensagens de grupos
  if (payload.isGroup === true) {
    return res.status(200).json({ ignored: 'group' });
  }

  // Ignorar eventos que não são mensagens recebidas
  if (payload.type && payload.type !== 'ReceivedCallback') {
    return res.status(200).json({ ignored: 'not_a_message' });
  }

  // ── Extrair dados da mensagem ─────────────────────────────────────────────
  const rawPhone   = payload.phone || payload.participantPhone;
  const senderName = payload.senderName || payload.chatName || '';

  if (!rawPhone) {
    console.warn('[INCOMING] Payload sem número de telefone:', JSON.stringify(payload));
    return res.status(400).json({ error: 'Número de telefone não encontrado' });
  }

  const phone     = normalizePhone(rawPhone);
  let   msgText   = '';
  let   isImage   = false;

  if (payload.text?.message) {
    msgText = payload.text.message.trim();
  } else if (payload.image || payload.document) {
    isImage = true;
    msgText = '[imagem]';
  } else {
    // Áudio, sticker, etc. — ignorar silenciosamente
    return res.status(200).json({ ignored: 'unsupported_type' });
  }

  console.log(`[INCOMING] ${phone} (${senderName}): "${msgText}" | isImage=${isImage}`);

  // ── Obter ou criar estado do lead ─────────────────────────────────────────
  let lead = await getLeadState(phone);

  if (!lead) {
    console.log(`[INCOMING] Novo lead: ${phone}`);
    lead = await createLeadState(phone, senderName);
  }

  // Actualizar nome se não tínhamos
  if (senderName && !lead.name) {
    await updateLeadName(phone, senderName);
    lead.name = senderName;
  }

  // ── Processar mensagem no motor de fluxo ──────────────────────────────────
  const { nextStep, messages, nextData } = processMessage(lead, msgText, isImage);

  console.log(`[INCOMING] ${phone}: ${lead.step} → ${nextStep} | mensagens: ${messages.length}`);

  // ── Enviar respostas via Z-API ────────────────────────────────────────────
  if (messages.length > 0) {
    try {
      await sendMessages(phone, messages, 600);
    } catch (err) {
      console.error('[INCOMING] Erro ao enviar mensagem:', err.message);
      return res.status(500).json({ error: 'Falha ao enviar mensagem', detail: err.message });
    }
  }

  // ── Actualizar estado no Supabase ─────────────────────────────────────────
  await setLeadState(phone, nextStep, nextData);

  return res.status(200).json({
    success:  true,
    phone,
    prevStep: lead.step,
    nextStep,
    sent:     messages.length,
  });
}

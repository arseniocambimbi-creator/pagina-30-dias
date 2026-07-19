/**
 * API de Conversões — endpoint chamado pelo navegador
 *
 * Endpoint: POST /api/capi
 *   Recebe eventos do Pixel (PageView, InitiateCheckout) e reenvia-os ao Meta
 *   pelo lado do servidor, com o mesmo `event_id` para deduplicação.
 *
 * Corpo esperado (JSON):
 *   {
 *     "event_name": "InitiateCheckout",
 *     "event_id":   "abc-123",              // o MESMO usado no fbq(...)
 *     "event_source_url": "https://...",
 *     "custom_data": { "value": 2500, "currency": "AOA", ... },
 *     "fbp": "fb.1...", "fbc": "fb.1..."     // opcionais (cookies do pixel)
 *   }
 */

import { sendMetaEvent, getClientIp, parseCookie } from '../lib/meta-capi.js';

// Só permitimos estes eventos vindos do navegador.
const ALLOWED_EVENTS = new Set(['PageView', 'InitiateCheckout', 'ViewContent', 'Lead']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const eventName = body.event_name;
    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return res.status(400).json({ error: 'event_name inválido ou não permitido' });
    }

    const cookieHeader = req.headers.cookie;
    const fbp = body.fbp || parseCookie(cookieHeader, '_fbp');
    const fbc = body.fbc || parseCookie(cookieHeader, '_fbc');

    const result = await sendMetaEvent({
      eventName,
      eventId:        body.event_id,
      eventSourceUrl: body.event_source_url || req.headers.referer,
      actionSource:   'website',
      userData: {
        fbp,
        fbc,
        clientIp:  getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
      customData: body.custom_data || {},
    });

    // Não devolvemos o corpo do Meta ao navegador (pode conter detalhes internos).
    return res.status(result.ok ? 200 : 502).json({ success: result.ok });
  } catch (err) {
    console.error('[CAPI endpoint] Erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

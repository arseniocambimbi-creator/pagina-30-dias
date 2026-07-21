/**
 * Meta Conversions API (CAPI) — módulo partilhado
 *
 * Envia eventos do lado do servidor para o Meta, em paralelo com o Pixel do
 * navegador. Os eventos são deduplicados pelo Meta através do `event_id`
 * (o mesmo id tem de ser usado no Pixel e na CAPI para o mesmo evento).
 *
 * Variáveis de ambiente necessárias (configurar no Vercel):
 *   META_PIXEL_ID      → ID do pixel  (ex: 1536891164848719)
 *   META_CAPI_TOKEN    → Token de acesso da API de Conversões (SECRETO)
 *   META_TEST_EVENT_CODE (opcional) → código de teste do Events Manager
 *
 * NUNCA colocar o token no código nem no HTML. Só em variável de ambiente.
 */

import crypto from 'node:crypto';

const GRAPH_VERSION = 'v21.0';

// ── Hash SHA-256 exigido pelo Meta para dados pessoais (email, telefone…) ──
function hash(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Telefone: só dígitos, com código do país, sem "+". Depois é hasheado.
function hashPhone(phone) {
  if (!phone) return undefined;
  let p = String(phone).replace(/\D/g, '');
  if (!p.startsWith('244') && p.length === 9) p = '244' + p; // Angola
  return hash(p);
}

/**
 * Envia um evento para a API de Conversões do Meta.
 *
 * @param {Object}  opts
 * @param {string}  opts.eventName        ex: 'PageView', 'InitiateCheckout', 'Purchase'
 * @param {string}  [opts.eventId]        id de deduplicação (o mesmo do Pixel)
 * @param {string}  [opts.eventSourceUrl] URL onde o evento aconteceu
 * @param {string}  [opts.actionSource]   'website' (padrão) | 'system_generated'
 * @param {Object}  [opts.userData]       { email, phone, fbp, fbc, clientIp, userAgent,
 *                                          city, state, zip, country, externalId }
 * @param {Object}  [opts.customData]     { value, currency, content_name, ... }
 * @returns {Promise<{ok: boolean, status: number, body: any}>}
 */
export async function sendMetaEvent({
  eventName,
  eventId,
  eventSourceUrl,
  actionSource = 'website',
  userData = {},
  customData = {},
} = {}) {
  // O pixel ID é público (já está no index.html), por isso tem valor por omissão.
  // O TOKEN é secreto e vem SEMPRE de variável de ambiente — nunca fica no código.
  const PIXEL_ID = process.env.META_PIXEL_ID || '1536891164848719';
  const TOKEN    = process.env.META_CAPI_TOKEN;

  // Sem credenciais → não rebenta a app, apenas avisa e ignora.
  if (!PIXEL_ID || !TOKEN) {
    console.warn('[CAPI] META_PIXEL_ID ou META_CAPI_TOKEN em falta — evento ignorado:', eventName);
    return { ok: false, status: 0, body: { skipped: 'missing_env' } };
  }

  const user_data = {};
  const em = hash(userData.email);
  const ph = hashPhone(userData.phone);
  if (em) user_data.em = [em];
  if (ph) user_data.ph = [ph];

  // Geolocalização real do visitante (derivada do IP pelo Vercel) — hasheada,
  // normalizada como o Meta exige: minúsculas, sem espaços nem pontuação.
  const geoNorm = v => v ? String(v).normalize('NFD').replace(/[̀-ͯ]/g, '')
                                    .toLowerCase().replace(/[^a-z0-9]/g, '') : undefined;
  const ct = hash(geoNorm(userData.city));
  const st = hash(geoNorm(userData.state));
  const zp = hash(geoNorm(userData.zip));
  const country = hash(geoNorm(userData.country)); // código de 2 letras, ex: "ao"
  if (ct)      user_data.ct      = [ct];
  if (st)      user_data.st      = [st];
  if (zp)      user_data.zp      = [zp];
  if (country) user_data.country = [country];

  // ID anónimo próprio (melhora a atribuição sem dados pessoais)
  const eid = hash(userData.externalId);
  if (eid) user_data.external_id = [eid];

  if (userData.fbp)       user_data.fbp = userData.fbp;
  if (userData.fbc)       user_data.fbc = userData.fbc;
  if (userData.clientIp)  user_data.client_ip_address  = userData.clientIp;
  if (userData.userAgent) user_data.client_user_agent  = userData.userAgent;

  const event = {
    event_name:   eventName,
    event_time:   Math.floor(Date.now() / 1000),
    action_source: actionSource,
    user_data,
  };
  if (eventId)        event.event_id         = eventId;
  if (eventSourceUrl) event.event_source_url = eventSourceUrl;
  if (customData && Object.keys(customData).length) event.custom_data = customData;

  const payload = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`;

  try {
    const res  = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[CAPI] Erro Meta:', res.status, JSON.stringify(body));
    } else {
      console.log('[CAPI] Evento enviado:', eventName, 'events_received=', body.events_received);
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error('[CAPI] Falha de rede:', err.message);
    return { ok: false, status: 0, body: { error: err.message } };
  }
}

// ── Utilitários reutilizáveis pelos endpoints ──
export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.socket?.remoteAddress || undefined;
}

export function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return undefined;
  const m = String(cookieHeader).match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

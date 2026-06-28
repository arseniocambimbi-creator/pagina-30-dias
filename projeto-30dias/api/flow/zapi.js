/**
 * Z-API — Helpers de envio de mensagens
 *
 * Reutilizável por qualquer ficheiro da API.
 */

const ZAPI_INSTANCE_ID  = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN        = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN || '';

/**
 * Normalizar número de telefone angolano.
 * Exemplo: "951257125" → "244951257125"
 * @param {string|number} phone
 * @returns {string}
 */
export function normalizePhone(phone) {
  let p = String(phone).replace(/\D/g, '');
  if (!p.startsWith('244') && p.length === 9) p = '244' + p;
  return p;
}

/**
 * Enviar mensagem de texto via Z-API.
 * @param {string} phone  - Número já normalizado (ex: "244951257125")
 * @param {string} text   - Texto a enviar
 * @returns {Promise<object>}
 */
export async function sendMessage(phone, text) {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    throw new Error('Variáveis ZAPI_INSTANCE_ID e ZAPI_TOKEN não configuradas');
  }

  const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

  const reqHeaders = { 'Content-Type': 'application/json' };
  if (ZAPI_CLIENT_TOKEN) reqHeaders['Client-Token'] = ZAPI_CLIENT_TOKEN;

  const res = await fetch(url, {
    method:  'POST',
    headers: reqHeaders,
    body:    JSON.stringify({ phone, message: text }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

/**
 * Enviar múltiplas mensagens sequencialmente com delay entre elas.
 * @param {string}   phone    - Número normalizado
 * @param {string[]} messages - Array de textos
 * @param {number}   [delay]  - Millisegundos entre mensagens (default 500ms)
 */
export async function sendMessages(phone, messages, delay = 500) {
  for (let i = 0; i < messages.length; i++) {
    await sendMessage(phone, messages[i]);
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

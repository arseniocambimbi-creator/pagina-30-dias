/**
 * Supabase — Gestão de Estado dos Leads
 *
 * Tabela: lead_states
 *   phone      TEXT PRIMARY KEY
 *   name       TEXT
 *   step       TEXT  (ex: 'NEW', 'M1_SENT', 'M5_SENT', 'PURCHASED', ...)
 *   data       JSONB (informação extra: pain_type, objections, etc.)
 *   created_at TIMESTAMPTZ
 *   updated_at TIMESTAMPTZ
 */

const SUPABASE_URL       = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY  = process.env.SUPABASE_ANON_KEY;
const TABLE              = 'lead_states';

function headers() {
  return {
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation',
  };
}

/**
 * Ler estado de um lead pelo número de telefone.
 * @param {string} phone
 * @returns {Promise<object|null>}
 */
export async function getLeadState(phone) {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?phone=eq.${encodeURIComponent(phone)}&select=*`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    console.error('[DB] getLeadState error:', await res.text());
    return null;
  }
  const rows = await res.json();
  return rows[0] || null;
}

/**
 * Criar estado inicial de um novo lead.
 * @param {string} phone
 * @param {string} name
 * @returns {Promise<object>}
 */
export async function createLeadState(phone, name) {
  const url  = `${SUPABASE_URL}/rest/v1/${TABLE}`;
  const body = { phone, name: name || '', step: 'NEW', data: {} };
  const res  = await fetch(url, {
    method:  'POST',
    headers: headers(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('[DB] createLeadState error:', await res.text());
    throw new Error('Erro ao criar estado do lead');
  }
  const rows = await res.json();
  return rows[0] || body;
}

/**
 * Actualizar step e/ou data de um lead.
 * @param {string} phone
 * @param {string} step
 * @param {object} [extraData={}]
 * @returns {Promise<void>}
 */
export async function setLeadState(phone, step, extraData = {}) {
  const url  = `${SUPABASE_URL}/rest/v1/${TABLE}?phone=eq.${encodeURIComponent(phone)}`;
  const body = {
    step,
    data:       extraData,
    updated_at: new Date().toISOString(),
  };
  const res  = await fetch(url, {
    method:  'PATCH',
    headers: headers(),
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('[DB] setLeadState error:', await res.text());
  }
}

/**
 * Actualizar só o nome de um lead.
 * @param {string} phone
 * @param {string} name
 */
export async function updateLeadName(phone, name) {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?phone=eq.${encodeURIComponent(phone)}`;
  await fetch(url, {
    method:  'PATCH',
    headers: headers(),
    body:    JSON.stringify({ name }),
  });
}

/**
 * Verificar se a ligação Supabase está configurada.
 */
export function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

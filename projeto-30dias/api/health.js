/**
 * Health check — GET /api/health
 * Confirma que todas as variáveis de ambiente estão configuradas.
 */
export default async function handler(req, res) {
  const env = {
    ZAPI_INSTANCE_ID:  !!process.env.ZAPI_INSTANCE_ID,
    ZAPI_TOKEN:        !!process.env.ZAPI_TOKEN,
    ZAPI_CLIENT_TOKEN: !!process.env.ZAPI_CLIENT_TOKEN,
    WA_VERIFY_TOKEN:   !!process.env.WA_VERIFY_TOKEN,
    ACCESS_LINK:       !!process.env.ACCESS_LINK,
    SUPABASE_URL:      !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    AGENT_NAME:        !!process.env.AGENT_NAME,
  };

  // Variáveis obrigatórias para funcionamento completo
  const required = [
    'ZAPI_INSTANCE_ID', 'ZAPI_TOKEN',
    'ACCESS_LINK',
    'SUPABASE_URL', 'SUPABASE_ANON_KEY',
  ];

  const allOk = required.every(k => env[k]);

  // Teste rápido de conectividade com Supabase
  let supabaseStatus = 'not_configured';
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
    try {
      const r = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/lead_states?select=count&limit=1`,
        {
          headers: {
            'apikey':        process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
      supabaseStatus = r.ok ? 'connected' : `error_${r.status}`;
    } catch (e) {
      supabaseStatus = `unreachable: ${e.message}`;
    }
  }

  return res.status(allOk ? 200 : 500).json({
    status:         allOk ? 'ok' : 'incomplete',
    env,
    supabase:       supabaseStatus,
    webhook_url:    '/api/incoming  ← configura este URL na Z-API como webhook de entrada',
    timestamp:      new Date().toISOString(),
  });
}

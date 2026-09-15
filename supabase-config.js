// =========================================================
// CONFIGURACIÓN DE SUPABASE
// Reemplaza estos dos valores con los de TU proyecto:
// Supabase → Project Settings → API
// =========================================================
const SUPABASE_URL = "PEGA_AQUI_TU_SUPABASE_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_SUPABASE_ANON_KEY";

// No modificar debajo de esta línea
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

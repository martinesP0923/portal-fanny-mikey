// =========================================================
// CONFIGURACIÓN DE SUPABASE
// Reemplaza estos dos valores con los de TU proyecto:
// Supabase → Project Settings → API
// =========================================================
const SUPABASE_URL = "https://gecdlfljjiljikgfpatz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY2RsZmxqamlsamlrZ2ZwYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDI5ODcsImV4cCI6MjEwMzk3ODk4N30.Q2fi4irgIt50zMNkmlPIAglYiSiV2DOSAa65FSUZHoE";

// No modificar debajo de esta línea
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

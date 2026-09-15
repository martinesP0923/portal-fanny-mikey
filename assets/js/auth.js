// =========================================================
// AUTH.JS — funciones de sesión compartidas
// Requiere que supabase-config.js se haya cargado antes.
// =========================================================

async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function requireLogin(redirectTo = "presentadores.html") {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "presentadores.html";
}

async function loginWithEmail(email, password) {
  return await supabaseClient.auth.signInWithPassword({ email, password });
}

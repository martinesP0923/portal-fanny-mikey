// =========================================================
// EMISORA.JS — página pública de la emisora
// =========================================================

async function loadNowPlaying() {
  const { data, error } = await supabaseClient
    .from("now_playing")
    .select("song_name, artist")
    .eq("id", 1)
    .single();

  const songEl = document.getElementById("np-song");
  const artistEl = document.getElementById("np-artist");

  if (error || !data || !data.song_name) {
    songEl.textContent = "Aún no hay ninguna canción al aire";
    artistEl.textContent = "";
    return;
  }
  songEl.textContent = data.song_name;
  artistEl.textContent = data.artist || "";
}

function showRequestStatus(message, ok) {
  const box = document.getElementById("request-status");
  box.textContent = message;
  box.className = "status-banner " + (ok ? "status-banner--ok" : "status-banner--error");
}

document.getElementById("request-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const song_name = document.getElementById("song_name").value.trim();
  const artist = document.getElementById("artist").value.trim();
  const requested_by = document.getElementById("requested_by").value.trim();
  const message = document.getElementById("message").value.trim();

  const { error } = await supabaseClient.from("song_requests").insert({
    song_name, artist,
    requested_by: requested_by || null,
    message: message || null
  });

  if (error) {
    showRequestStatus("No se pudo enviar la solicitud. Intenta de nuevo.", false);
    console.error(error);
  } else {
    showRequestStatus("¡Listo! Tu canción quedó en la lista de solicitudes.", true);
    e.target.reset();
  }
});

loadNowPlaying();
// refresca "sonando ahora" cada 20 segundos sin recargar la página
setInterval(loadNowPlaying, 20000);

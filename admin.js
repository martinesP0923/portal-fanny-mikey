// =========================================================
// ADMIN.JS — panel protegido de los presentadores
// =========================================================

(async function init() {
  const session = await requireLogin("presentadores.html");
  if (!session) return; // requireLogin ya redirige

  setupTabs();
  document.getElementById("logout-btn").addEventListener("click", logout);

  loadNowPlayingAdmin();
  loadRequests();
  setupNowPlayingForm();

  loadDanzaList();
  setupDanzaForm();

  loadNoticiasList();
  setupNoticiasForm();
})();

function setupTabs() {
  const buttons = document.querySelectorAll(".admin-tabs button");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("is-active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById(btn.dataset.tab).classList.add("is-active");
    });
  });
}

function showBanner(id, msg, ok) {
  const box = document.getElementById(id);
  box.textContent = msg;
  box.className = "status-banner " + (ok ? "status-banner--ok" : "status-banner--error");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

// Sube un archivo al bucket "media" y devuelve su URL pública
async function uploadMedia(file, folder) {
  if (!file) return null;
  const path = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabaseClient.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data } = supabaseClient.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

// ------------------------------------------------
// EMISORA
// ------------------------------------------------
async function loadNowPlayingAdmin() {
  const { data } = await supabaseClient.from("now_playing").select("*").eq("id", 1).single();
  if (data) {
    document.getElementById("np_song").value = data.song_name || "";
    document.getElementById("np_artist").value = data.artist || "";
  }
}

function setupNowPlayingForm() {
  document.getElementById("np-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const song_name = document.getElementById("np_song").value.trim();
    const artist = document.getElementById("np_artist").value.trim();
    const { error } = await supabaseClient
      .from("now_playing")
      .update({ song_name, artist, updated_at: new Date().toISOString() })
      .eq("id", 1);
    showBanner("np-status", error ? "No se pudo actualizar." : "Actualizado. Ya se ve en la página pública.", !error);
  });
}

async function loadRequests() {
  const el = document.getElementById("requests-list");
  const { data, error } = await supabaseClient
    .from("song_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">No hay solicitudes por ahora.</div>`;
    return;
  }

  el.innerHTML = data.map(r => `
    <div class="admin-list-item" data-id="${r.id}">
      <div class="admin-list-item__body">
        <div class="admin-list-item__title">${r.song_name} — ${r.artist}</div>
        <div class="admin-list-item__meta">
          ${r.requested_by ? `Pedida por ${r.requested_by} · ` : ""}${formatDate(r.created_at)}
          ${r.message ? `<br>"${r.message}"` : ""}
        </div>
      </div>
      <div class="admin-list-item__actions">
        <button class="btn btn--ghost" onclick="playThisRequest('${r.id}', ${JSON.stringify(r.song_name)}, ${JSON.stringify(r.artist)})">Poner al aire</button>
        <button class="btn btn--danger" onclick="deleteRequest('${r.id}')">Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.playThisRequest = async function (id, song_name, artist) {
  await supabaseClient.from("now_playing").update({ song_name, artist, updated_at: new Date().toISOString() }).eq("id", 1);
  document.getElementById("np_song").value = song_name;
  document.getElementById("np_artist").value = artist;
  showBanner("np-status", `Ahora suena: ${song_name}`, true);
};

window.deleteRequest = async function (id) {
  if (!confirm("¿Eliminar esta solicitud?")) return;
  await supabaseClient.from("song_requests").delete().eq("id", id);
  loadRequests();
};

// ------------------------------------------------
// DANZA Y TEATRO
// ------------------------------------------------
function setupDanzaForm() {
  document.getElementById("danza-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("danza-submit-btn");
    btn.disabled = true; btn.textContent = "Publicando…";

    try {
      const title = document.getElementById("d_title").value.trim();
      const content = document.getElementById("d_content").value.trim();
      const photoFile = document.getElementById("d_photo").files[0];
      const videoFile = document.getElementById("d_video").files[0];

      const photo_url = await uploadMedia(photoFile, "danza");
      const video_url = await uploadMedia(videoFile, "danza");

      const { error } = await supabaseClient.from("dance_theater_posts").insert({
        title, content, photo_url, video_url
      });
      if (error) throw error;

      showBanner("danza-status", "Publicación creada.", true);
      e.target.reset();
      loadDanzaList();
    } catch (err) {
      console.error(err);
      showBanner("danza-status", "Ocurrió un error al publicar.", false);
    } finally {
      btn.disabled = false; btn.textContent = "Publicar";
    }
  });
}

async function loadDanzaList() {
  const el = document.getElementById("danza-list");
  const { data, error } = await supabaseClient
    .from("dance_theater_posts").select("*").order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Aún no hay publicaciones.</div>`;
    return;
  }
  el.innerHTML = data.map(p => `
    <div class="admin-list-item">
      <div class="admin-list-item__body">
        <div class="admin-list-item__title">${p.title}</div>
        <div class="admin-list-item__meta">${formatDate(p.created_at)}</div>
      </div>
      <div class="admin-list-item__actions">
        <button class="btn btn--danger" onclick="deleteDanza('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.deleteDanza = async function (id) {
  if (!confirm("¿Eliminar esta publicación?")) return;
  await supabaseClient.from("dance_theater_posts").delete().eq("id", id);
  loadDanzaList();
};

// ------------------------------------------------
// NOTICIAS
// ------------------------------------------------
function setupNoticiasForm() {
  document.getElementById("noticias-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("noticias-submit-btn");
    btn.disabled = true; btn.textContent = "Publicando…";

    try {
      const epigrafe = document.getElementById("n_epigrafe").value.trim();
      const titular = document.getElementById("n_titular").value.trim();
      const bajada = document.getElementById("n_bajada").value.trim();
      const cuerpo = document.getElementById("n_cuerpo").value.trim();
      const photo1 = document.getElementById("n_photo1").files[0];
      const photo2 = document.getElementById("n_photo2").files[0];
      const video = document.getElementById("n_video").files[0];

      const photo_url_1 = await uploadMedia(photo1, "noticias");
      const photo_url_2 = await uploadMedia(photo2, "noticias");
      const video_url = await uploadMedia(video, "noticias");

      const { error } = await supabaseClient.from("news_posts").insert({
        epigrafe: epigrafe || null, titular, bajada: bajada || null, cuerpo,
        photo_url_1, photo_url_2, video_url
      });
      if (error) throw error;

      showBanner("noticias-status", "Noticia publicada.", true);
      e.target.reset();
      loadNoticiasList();
    } catch (err) {
      console.error(err);
      showBanner("noticias-status", "Ocurrió un error al publicar.", false);
    } finally {
      btn.disabled = false; btn.textContent = "Publicar noticia";
    }
  });
}

async function loadNoticiasList() {
  const el = document.getElementById("noticias-list");
  const { data, error } = await supabaseClient
    .from("news_posts").select("*").order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Aún no hay noticias.</div>`;
    return;
  }
  el.innerHTML = data.map(p => `
    <div class="admin-list-item">
      <div class="admin-list-item__body">
        <div class="admin-list-item__title">${p.titular}</div>
        <div class="admin-list-item__meta">${formatDate(p.created_at)}</div>
      </div>
      <div class="admin-list-item__actions">
        <button class="btn btn--danger" onclick="deleteNoticia('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.deleteNoticia = async function (id) {
  if (!confirm("¿Eliminar esta noticia?")) return;
  await supabaseClient.from("news_posts").delete().eq("id", id);
  loadNoticiasList();
};

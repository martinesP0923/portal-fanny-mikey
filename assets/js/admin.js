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
  const { error } = await supabaseClient
    .from("now_playing")
    .update({ song_name, artist, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error(error);
    showBanner("np-status", "No se pudo actualizar. Revisa la consola (F12) para más detalles.", false);
    return;
  }

  document.getElementById("np_song").value = song_name;
  document.getElementById("np_artist").value = artist;
  showBanner("np-status", `Ahora suena: ${song_name}`, true);
  loadNowPlayingAdmin();
};

window.deleteRequest = async function (id) {
  if (!confirm("¿Eliminar esta solicitud?")) return;
  await supabaseClient.from("song_requests").delete().eq("id", id);
  loadRequests();
};

// ------------------------------------------------
// DANZA Y TEATRO
// ------------------------------------------------
let editingDanzaId = null;
let editingDanzaPhotoUrl = null;
let editingDanzaVideoUrl = null;

function resetDanzaForm() {
  editingDanzaId = null;
  editingDanzaPhotoUrl = null;
  editingDanzaVideoUrl = null;
  document.getElementById("danza-form").reset();
  document.getElementById("danza-form-title").textContent = "Nueva publicación de Danza y Teatro";
  document.getElementById("danza-submit-btn").textContent = "Publicar";
  document.getElementById("danza-cancel-btn").style.display = "none";
  document.getElementById("danza-file-hint").style.display = "none";
}

function setupDanzaForm() {
  document.getElementById("danza-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("danza-submit-btn");
    const isEditing = !!editingDanzaId;
    btn.disabled = true; btn.textContent = isEditing ? "Guardando…" : "Publicando…";

    try {
      const title = document.getElementById("d_title").value.trim();
      const content = document.getElementById("d_content").value.trim();
      const photoFile = document.getElementById("d_photo").files[0];
      const videoFile = document.getElementById("d_video").files[0];

      let photo_url = editingDanzaPhotoUrl;
      let video_url = editingDanzaVideoUrl;
      if (photoFile) photo_url = await uploadMedia(photoFile, "danza");
      if (videoFile) video_url = await uploadMedia(videoFile, "danza");

      if (isEditing) {
        const { error } = await supabaseClient.from("dance_theater_posts")
          .update({ title, content, photo_url, video_url })
          .eq("id", editingDanzaId);
        if (error) throw error;
        showBanner("danza-status", "Publicación actualizada.", true);
      } else {
        const { error } = await supabaseClient.from("dance_theater_posts").insert({
          title, content, photo_url, video_url
        });
        if (error) throw error;
        showBanner("danza-status", "Publicación creada.", true);
      }

      resetDanzaForm();
      loadDanzaList();
    } catch (err) {
      console.error(err);
      showBanner("danza-status", "Ocurrió un error al guardar.", false);
    } finally {
      btn.disabled = false;
      if (btn.textContent !== "Publicar") btn.textContent = editingDanzaId ? "Guardar cambios" : "Publicar";
    }
  });

  document.getElementById("danza-cancel-btn").addEventListener("click", resetDanzaForm);
}

let danzaCache = [];

async function loadDanzaList() {
  const el = document.getElementById("danza-list");
  const { data, error } = await supabaseClient
    .from("dance_theater_posts").select("*").order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Aún no hay publicaciones.</div>`;
    danzaCache = [];
    return;
  }
  danzaCache = data;
  el.innerHTML = data.map(p => `
    <div class="admin-list-item">
      <div class="admin-list-item__body">
        <div class="admin-list-item__title">${p.title}</div>
        <div class="admin-list-item__meta">${formatDate(p.created_at)}</div>
      </div>
      <div class="admin-list-item__actions">
        <button class="btn btn--ghost" onclick="editDanza('${p.id}')">Editar</button>
        <button class="btn btn--danger" onclick="deleteDanza('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.editDanza = function (id) {
  const p = danzaCache.find(x => x.id === id);
  if (!p) return;
  editingDanzaId = p.id;
  editingDanzaPhotoUrl = p.photo_url;
  editingDanzaVideoUrl = p.video_url;

  document.getElementById("d_title").value = p.title || "";
  document.getElementById("d_content").value = p.content || "";
  document.getElementById("d_photo").value = "";
  document.getElementById("d_video").value = "";

  document.getElementById("danza-form-title").textContent = "Editando publicación";
  document.getElementById("danza-submit-btn").textContent = "Guardar cambios";
  document.getElementById("danza-cancel-btn").style.display = "inline-block";
  document.getElementById("danza-file-hint").style.display = "block";

  document.getElementById("tab-danza").scrollIntoView({ behavior: "smooth" });
};

window.deleteDanza = async function (id) {
  if (!confirm("¿Eliminar esta publicación?")) return;
  await supabaseClient.from("dance_theater_posts").delete().eq("id", id);
  if (editingDanzaId === id) resetDanzaForm();
  loadDanzaList();
};

// ------------------------------------------------
// NOTICIAS
// ------------------------------------------------
let editingNoticiaId = null;
let editingNoticiaPhoto1 = null;
let editingNoticiaPhoto2 = null;
let editingNoticiaVideo = null;

function resetNoticiasForm() {
  editingNoticiaId = null;
  editingNoticiaPhoto1 = null;
  editingNoticiaPhoto2 = null;
  editingNoticiaVideo = null;
  document.getElementById("noticias-form").reset();
  document.getElementById("noticias-form-title").textContent = "Nueva noticia";
  document.getElementById("noticias-submit-btn").textContent = "Publicar noticia";
  document.getElementById("noticias-cancel-btn").style.display = "none";
  document.getElementById("noticias-file-hint").style.display = "none";
}

function setupNoticiasForm() {
  document.getElementById("noticias-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("noticias-submit-btn");
    const isEditing = !!editingNoticiaId;
    btn.disabled = true; btn.textContent = isEditing ? "Guardando…" : "Publicando…";

    try {
      const epigrafe = document.getElementById("n_epigrafe").value.trim();
      const titular = document.getElementById("n_titular").value.trim();
      const bajada = document.getElementById("n_bajada").value.trim();
      const cuerpo = document.getElementById("n_cuerpo").value.trim();
      const photo1 = document.getElementById("n_photo1").files[0];
      const photo2 = document.getElementById("n_photo2").files[0];
      const video = document.getElementById("n_video").files[0];

      let photo_url_1 = editingNoticiaPhoto1;
      let photo_url_2 = editingNoticiaPhoto2;
      let video_url = editingNoticiaVideo;
      if (photo1) photo_url_1 = await uploadMedia(photo1, "noticias");
      if (photo2) photo_url_2 = await uploadMedia(photo2, "noticias");
      if (video) video_url = await uploadMedia(video, "noticias");

      const payload = {
        epigrafe: epigrafe || null, titular, bajada: bajada || null, cuerpo,
        photo_url_1, photo_url_2, video_url
      };

      if (isEditing) {
        const { error } = await supabaseClient.from("news_posts").update(payload).eq("id", editingNoticiaId);
        if (error) throw error;
        showBanner("noticias-status", "Noticia actualizada.", true);
      } else {
        const { error } = await supabaseClient.from("news_posts").insert(payload);
        if (error) throw error;
        showBanner("noticias-status", "Noticia publicada.", true);
      }

      resetNoticiasForm();
      loadNoticiasList();
    } catch (err) {
      console.error(err);
      showBanner("noticias-status", "Ocurrió un error al guardar.", false);
    } finally {
      btn.disabled = false;
      if (btn.textContent !== "Publicar noticia") btn.textContent = editingNoticiaId ? "Guardar cambios" : "Publicar noticia";
    }
  });

  document.getElementById("noticias-cancel-btn").addEventListener("click", resetNoticiasForm);
}

let noticiasCache = [];

async function loadNoticiasList() {
  const el = document.getElementById("noticias-list");
  const { data, error } = await supabaseClient
    .from("news_posts").select("*").order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Aún no hay noticias.</div>`;
    noticiasCache = [];
    return;
  }
  noticiasCache = data;
  el.innerHTML = data.map(p => `
    <div class="admin-list-item">
      <div class="admin-list-item__body">
        <div class="admin-list-item__title">${p.titular}</div>
        <div class="admin-list-item__meta">${formatDate(p.created_at)}</div>
      </div>
      <div class="admin-list-item__actions">
        <button class="btn btn--ghost" onclick="editNoticia('${p.id}')">Editar</button>
        <button class="btn btn--danger" onclick="deleteNoticia('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join("");
}

window.editNoticia = function (id) {
  const p = noticiasCache.find(x => x.id === id);
  if (!p) return;
  editingNoticiaId = p.id;
  editingNoticiaPhoto1 = p.photo_url_1;
  editingNoticiaPhoto2 = p.photo_url_2;
  editingNoticiaVideo = p.video_url;

  document.getElementById("n_epigrafe").value = p.epigrafe || "";
  document.getElementById("n_titular").value = p.titular || "";
  document.getElementById("n_bajada").value = p.bajada || "";
  document.getElementById("n_cuerpo").value = p.cuerpo || "";
  document.getElementById("n_photo1").value = "";
  document.getElementById("n_photo2").value = "";
  document.getElementById("n_video").value = "";

  document.getElementById("noticias-form-title").textContent = "Editando noticia";
  document.getElementById("noticias-submit-btn").textContent = "Guardar cambios";
  document.getElementById("noticias-cancel-btn").style.display = "inline-block";
  document.getElementById("noticias-file-hint").style.display = "block";

  document.getElementById("tab-noticias").scrollIntoView({ behavior: "smooth" });
};

window.deleteNoticia = async function (id) {
  if (!confirm("¿Eliminar esta noticia?")) return;
  await supabaseClient.from("news_posts").delete().eq("id", id);
  if (editingNoticiaId === id) resetNoticiasForm();
  loadNoticiasList();
};

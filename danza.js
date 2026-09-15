// =========================================================
// DANZA.JS — galería pública de Danza y Teatro
// =========================================================

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function renderPost(post) {
  const media = post.photo_url
    ? `<img src="${post.photo_url}" alt="Foto de ${post.title}">`
    : (post.video_url ? `<video src="${post.video_url}" controls></video>` : "");

  return `
    <article class="gallery-card">
      <div class="gallery-card__media">${media}</div>
      <div class="gallery-card__body">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        ${post.video_url && post.photo_url ? `<video src="${post.video_url}" controls style="margin-top:0.8rem; width:100%;"></video>` : ""}
        <p class="news-item__date">${formatDate(post.created_at)}</p>
      </div>
    </article>
  `;
}

async function loadGallery() {
  const el = document.getElementById("gallery");
  const { data, error } = await supabaseClient
    .from("dance_theater_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    el.innerHTML = `<p>No se pudieron cargar las publicaciones.</p>`;
    console.error(error);
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Todavía no hay publicaciones de Danza y Teatro.</div>`;
    return;
  }
  el.innerHTML = data.map(renderPost).join("");
}

loadGallery();

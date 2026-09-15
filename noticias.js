// =========================================================
// NOTICIAS.JS — página pública de Noticias
// =========================================================

function formatNewsDate(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function renderNews(post) {
  let mediaHtml = "";
  if (post.photo_url_1) mediaHtml += `<img src="${post.photo_url_1}" alt="Foto de ${post.titular}">`;
  if (post.photo_url_2) mediaHtml += `<img src="${post.photo_url_2}" alt="Segunda foto de ${post.titular}" style="margin-top:0.6rem;">`;
  if (post.video_url) mediaHtml += `<video src="${post.video_url}" controls style="margin-top:0.6rem;"></video>`;

  return `
    <article class="news-item">
      <div class="news-item__text">
        ${post.epigrafe ? `<p class="news-item__epigrafe">${post.epigrafe}</p>` : ""}
        <h2 class="news-item__titular">${post.titular}</h2>
        ${post.bajada ? `<p class="news-item__bajada">${post.bajada}</p>` : ""}
        <p>${post.cuerpo}</p>
        <p class="news-item__date">${formatNewsDate(post.created_at)}</p>
      </div>
      <div class="news-item__media">${mediaHtml}</div>
    </article>
  `;
}

async function loadNews() {
  const el = document.getElementById("news-list");
  const { data, error } = await supabaseClient
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    el.innerHTML = `<p>No se pudieron cargar las noticias.</p>`;
    console.error(error);
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Todavía no hay noticias publicadas.</div>`;
    return;
  }
  el.innerHTML = data.map(renderNews).join("");
}

loadNews();

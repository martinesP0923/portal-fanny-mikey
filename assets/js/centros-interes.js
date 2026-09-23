// =========================================================
// CENTROS-INTERES.JS — página pública de Centros de interés
// =========================================================

function renderCentro(c) {
  const media = c.photo_url ? `<img src="${c.photo_url}" alt="Foto de ${c.title}">` : "";
  return `
    <article class="gallery-card">
      <div class="gallery-card__media">${media}</div>
      <div class="gallery-card__body">
        <h3>${c.title}</h3>
        <p>${c.description}</p>
      </div>
    </article>
  `;
}

async function loadCentros() {
  const el = document.getElementById("centros-list");
  const { data, error } = await supabaseClient
    .from("interest_centers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    el.innerHTML = `<p>No se pudieron cargar los centros de interés.</p>`;
    console.error(error);
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Todavía no hay centros de interés publicados.</div>`;
    return;
  }
  el.innerHTML = data.map(renderCentro).join("");
}

loadCentros();

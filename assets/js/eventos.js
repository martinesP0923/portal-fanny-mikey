// =========================================================
// EVENTOS.JS — página pública de Eventos
// =========================================================

function formatEventDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function renderEvent(ev) {
  const media = ev.photo_url ? `<img src="${ev.photo_url}" alt="Foto de ${ev.title}">` : "";
  return `
    <article class="gallery-card">
      <div class="gallery-card__media">${media}</div>
      <div class="gallery-card__body">
        <h3>${ev.title}</h3>
        ${ev.event_date ? `<p style="color:var(--blue); font-weight:600; margin:0 0 0.3rem;">📅 ${formatEventDate(ev.event_date)}</p>` : ""}
        ${ev.location ? `<p style="color:#6b6d72; font-size:0.9rem; margin:0 0 0.6rem;">📍 ${ev.location}</p>` : ""}
        <p>${ev.description}</p>
      </div>
    </article>
  `;
}

async function loadEvents() {
  const el = document.getElementById("events-list");
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) {
    el.innerHTML = `<p>No se pudieron cargar los eventos.</p>`;
    console.error(error);
    return;
  }
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state">Todavía no hay eventos publicados.</div>`;
    return;
  }
  el.innerHTML = data.map(renderEvent).join("");
}

loadEvents();

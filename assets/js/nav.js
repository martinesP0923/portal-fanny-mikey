// =========================================================
// NAV.JS — comportamiento del menú hamburguesa (☰)
// =========================================================
(function () {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("masthead-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Cerrar el menú si se hace clic fuera de él
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

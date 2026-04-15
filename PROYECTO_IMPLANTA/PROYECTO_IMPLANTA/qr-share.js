document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll("[data-qr-share]");
  if (!containers.length) return;

  const fixedUrl = "https://gain-mass.onrender.com";

  containers.forEach((box) => {
    const input = box.querySelector("[data-qr-url-input]");
    const img = box.querySelector("[data-qr-image]");
    const link = box.querySelector("[data-qr-link]");
    const tip = box.querySelector("[data-qr-tip]");
    const btn = box.querySelector("[data-qr-generate]");

    if (!input || !img || !link || !tip || !btn) return;

    input.value = fixedUrl;

    function render(url) {
      const clean = (url || "").trim();
      if (!clean) return;
      const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
        encodeURIComponent(clean);
      img.src = qrUrl;
      img.alt = "QR de acceso a GAIN MASS";
      link.href = clean;
      link.textContent = clean;
    }

    btn.addEventListener("click", () => render(fixedUrl));
    render(fixedUrl);

    tip.textContent = "Este QR abre la app oficial en produccion.";
  });
});

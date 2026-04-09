document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll("[data-qr-share]");
  if (!containers.length) return;

  const current = window.location.href;
  const isLocal = /localhost|127\.0\.0\.1/i.test(window.location.hostname);

  containers.forEach((box) => {
    const input = box.querySelector("[data-qr-url-input]");
    const img = box.querySelector("[data-qr-image]");
    const link = box.querySelector("[data-qr-link]");
    const tip = box.querySelector("[data-qr-tip]");
    const btn = box.querySelector("[data-qr-generate]");

    if (!input || !img || !link || !tip || !btn) return;

    input.value = current;

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

    btn.addEventListener("click", () => render(input.value));
    render(current);

    if (isLocal) {
      tip.textContent =
        "Estas usando localhost. Para abrir desde tu celular, pon la IP de tu PC (ej: http://192.168.1.20:5500/) y pulsa Generar QR.";
    } else {
      tip.textContent =
        "Si tu celular y tu PC estan en la misma red, este QR deberia abrir la app.";
    }
  });
});

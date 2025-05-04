export function crearContadorRacha(container, rachaInicial = 0) {
  const rachaDisplay = document.createElement("div");
  rachaDisplay.id = "racha-simple";
  rachaDisplay.className = "racha-contador";
  rachaDisplay.textContent = `🔥 Racha: ${rachaInicial}`;
  container.appendChild(rachaDisplay);
}

export function actualizarContadorRacha(nuevaRacha) {
  const rachaEl = document.getElementById("racha-simple");
  if (rachaEl) {
    rachaEl.textContent = `🔥 Racha: ${nuevaRacha}`;
    rachaEl.classList.remove("racha-animada");
    void rachaEl.offsetWidth; // Reinicia animación
    rachaEl.classList.add("racha-animada");
  }
}

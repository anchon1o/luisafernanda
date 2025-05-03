const texto = [
  {
    personaje: "LUISA",
    texto: "¡Qué hermoso día! Me alegra el alma salir a pasear por el parque..."
  },
  {
    personaje: "VIDAL",
    texto: "¡Por fin llego! Este lugar guarda tantos recuerdos..."
  },
  {
    personaje: "CAROLINA",
    texto: "No entiendo cómo Luisa puede enamorarse de alguien como él..."
  }
];

function changeView(mode) {
  const main = document.getElementById("main-content");
  main.innerHTML = "";

  if (mode === "guion") {
    const pre = document.createElement("pre");
    pre.className = "guion";
    texto.forEach(linea => {
      pre.textContent += `${linea.personaje}:\n${linea.texto}\n\n`;
    });
    main.appendChild(pre);
  }

  if (mode === "chat") {
    const div = document.createElement("div");
    div.className = "chat";
    texto.forEach(linea => {
      const bubble = document.createElement("div");
      bubble.className = `bubble ${linea.personaje.toLowerCase()}`;
      bubble.innerHTML = `<strong>${linea.personaje}:</strong> ${linea.texto}`;
      div.appendChild(bubble);
    });
    main.appendChild(div);
  }

  if (mode === "fragmentos") {
    texto.forEach(linea => {
      const frag = document.createElement("div");
      frag.className = "fragmento";
      frag.innerHTML = `<strong>${linea.personaje}</strong><br><button class="reveal">Mostrar texto</button><div style="display:none;" class="text">${linea.texto}</div>`;
      frag.querySelector(".reveal").addEventListener("click", () => {
        frag.querySelector(".text").style.display = "block";
      });
      main.appendChild(frag);
    });
  }
}

changeView("guion");


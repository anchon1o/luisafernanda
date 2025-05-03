let bloquesGlobales = [];

async function cargarTexto() {
  const respuesta = await fetch('texto.txt');
  const textoPlano = await respuesta.text();
  const lineas = textoPlano.split('\n');

  const bloques = [];

  for (let linea of lineas) {
    linea = linea.trim();
    if (linea.match(/^[A-ZÁÉÍÓÚÑÜ\s]+:/)) {
      const [personaje, ...resto] = linea.split(':');
      bloques.push({
        personaje: personaje.trim(),
        texto: resto.join(':').trim()
      });
    } else if (linea !== '' && bloques.length > 0) {
      bloques[bloques.length - 1].texto += ' ' + linea;
    }
  }

  bloquesGlobales = bloques;
  mostrarVista('guion');
}

function cambiarVista(vista) {
  mostrarVista(vista);
}

function mostrarVista(vista) {
  const main = document.getElementById("main-content");
  main.innerHTML = "";

  if (vista === "guion") {
    const pre = document.createElement("pre");
    pre.className = "guion";
    bloquesGlobales.forEach(linea => {
      pre.textContent += `${linea.personaje}:\n${linea.texto}\n\n`;
    });
    main.appendChild(pre);
  }

  if (vista === "chat") {
    const div = document.createElement("div");
    div.className = "chat";
    bloquesGlobales.forEach(linea => {
      const bubble = document.createElement("div");
      bubble.className = `bubble ${linea.personaje.toLowerCase().replaceAll(' ', '-')}`;
      bubble.innerHTML = `<strong>${linea.personaje}:</strong> ${linea.texto}`;
      div.appendChild(bubble);
    });
    main.appendChild(div);
  }

  if (vista === "fragmentos") {
    bloquesGlobales.forEach(linea => {
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

cargarTexto();

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
      // Añadir líneas adicionales al texto del último personaje
      bloques[bloques.length - 1].texto += ' ' + linea;
    }
  }

  return bloques;
}

function mostrarGuion(bloques) {
  const main = document.getElementById("main-content");
  main.innerHTML = "";
  const pre = document.createElement("pre");
  pre.className = "guion";
  bloques.forEach(linea => {
    pre.textContent += `${linea.personaje}:\n${linea.texto}\n\n`;
  });
  main.appendChild(pre);
}

async function iniciar() {
  const bloques = await cargarTexto();
  mostrarGuion(bloques);
}

iniciar();

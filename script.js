let bloquesPorNumero = {};
let ordenNumeros = [];

async function cargarTexto() {
  const resp = await fetch('texto.txt');
  const texto = await resp.text();
  const lineas = texto.split('\n');

  let numeroActual = 'todo';
  let textoBloque = '';
  bloquesPorNumero[numeroActual] = '';

  for (let linea of lineas) {
    if (linea.startsWith('###')) {
      // Guardar el bloque anterior
      if (!bloquesPorNumero[numeroActual]) bloquesPorNumero[numeroActual] = '';
      bloquesPorNumero[numeroActual] += textoBloque;
      textoBloque = '';

      // Detectar número
      const matchMusical = linea.match(/^###\s+(Nº[\dA-Z]+)\s+🎵/i);
      const matchHablado = linea.match(/^###\s+▪️(\d+)\)/);
      if (matchMusical) {
        numeroActual = matchMusical[1].toLowerCase();
        ordenNumeros.push({ id: numeroActual, label: `${matchMusical[1]} 🎵` });
      } else if (matchHablado) {
        numeroActual = `t${matchHablado[1]}`;
        ordenNumeros.push({ id: numeroActual, label: '▪️' });
      }
      bloquesPorNumero[numeroActual] = '';
    } else {
      textoBloque += linea + '\n';
    }
  }
  bloquesPorNumero[numeroActual] += textoBloque;

  construirMenu();
  mostrarNumero('todo');
}

function construirMenu() {
  const menu = document.getElementById('menu-scroll');
  menu.innerHTML = ''; // Limpiar primero

  const botonTodo = document.createElement('button');
  botonTodo.textContent = 'LF';
  botonTodo.onclick = () => mostrarNumero('todo');
  menu.appendChild(botonTodo);

  const separador = () => {
    const span = document.createElement('span');
    span.textContent = '|';
    menu.appendChild(span);
  };

  separador();

  ordenNumeros.forEach((num, i) => {
    const btn = document.createElement('button');
    btn.textContent = num.label;
    btn.onclick = () => mostrarNumero(num.id);
    menu.appendChild(btn);

    // Añadir separador opcional entre actos (puedes ajustarlo según quieras)
    if ((i + 1) % 15 === 0) separador();
  });
}

function mostrarNumero(numeroId) {
  const main = document.getElementById("main-content");
  main.innerHTML = "";

  if (numeroId === 'todo') {
    for (let clave of Object.keys(bloquesPorNumero)) {
      const pre = document.createElement("pre");
      pre.textContent = bloquesPorNumero[clave];
      pre.className = 'guion';
      main.appendChild(pre);
    }
  } else {
    const pre = document.createElement("pre");
    pre.textContent = bloquesPorNumero[numeroId] || 'Contenido no encontrado.';
    pre.className = 'guion';
    main.appendChild(pre);
  }
}

cargarTexto();

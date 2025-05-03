let bloquesPorNumero = {};
let ordenNumeros = [];
let vistaActual = 'guion';
let numeroSeleccionado = 'todo';

async function cargarTexto() {
  const resp = await fetch('texto.txt');
  const texto = await resp.text();
  const lineas = texto.split('\n');

  let numeroActual = 'todo';
  let textoBloque = '';
  bloquesPorNumero[numeroActual] = '';

  for (let linea of lineas) {
    if (linea.startsWith('###')) {
      if (!bloquesPorNumero[numeroActual]) bloquesPorNumero[numeroActual] = '';
      bloquesPorNumero[numeroActual] += textoBloque;
      textoBloque = '';

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
  mostrarVista();
}

function construirMenu() {
  const menu = document.getElementById('menu-scroll');
  menu.innerHTML = '';

  const botonTodo = document.createElement('button');
  botonTodo.textContent = 'LF';
  botonTodo.onclick = () => { numeroSeleccionado = 'todo'; mostrarVista(); };
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
    btn.onclick = () => { numeroSeleccionado = num.id; mostrarVista(); };
    menu.appendChild(btn);
    if ((i + 1) % 15 === 0) separador();
  });
}

function cambiarVista(vista) {
  vistaActual = vista;
  mostrarVista();
}

function mostrarVista() {
  const main = document.getElementById("main-content");
  main.innerHTML = "";

  const bloques = numeroSeleccionado === 'todo'
    ? Object.values(bloquesPorNumero).join('\n\n')
    : bloquesPorNumero[numeroSeleccionado] || 'Contenido no encontrado.';

  const entradas = parsearBloques(bloques);

  if (vistaActual === 'guion') {
    const pre = document.createElement("pre");
    pre.className = "guion";
    entradas.forEach(linea => {
      pre.textContent += `${linea.personaje}:\n${linea.texto}\n\n`;
    });
    main.appendChild(pre);
  }

  if (vistaActual === 'chat') {
    const div = document.createElement("div");
    div.className = "chat";
    entradas.forEach(linea => {
      const bubble = document.createElement("div");
      bubble.className = `bubble ${linea.personaje.toLowerCase().replaceAll(' ', '-').replaceAll('ñ', 'n')}`;
      bubble.innerHTML = `<strong>${linea.personaje}:</strong> ${linea.texto}`;
      div.appendChild(bubble);
    });
    main.appendChild(div);
  }

  if (vistaActual === 'fragmentos') {
    entradas.forEach(linea => {
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

function parsearBloques(bloque) {
  const lineas = bloque.split('\n');
  const resultado = [];
  let actual = null;

  for (let linea of lineas) {
    linea = linea.trim();
    const match = linea.match(/^\[([A-ZÁÉÍÓÚÑÜ\s]+)\]$/);
    if (match) {
      actual = { personaje: match[1].trim(), texto: '' };
      resultado.push(actual);
    } else if (linea !== '' && actual) {
      actual.texto += (actual.texto ? ' ' : '') + linea;
    }
  }
  return resultado;
}

cargarTexto();

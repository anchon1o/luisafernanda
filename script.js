let bloquesPorNumero = {};
let ordenNumeros = [];
let vistaActual = 'guion';
let numeroSeleccionado = 'todo';
let personajesOcultos = new Set();

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

  if (vistaActual === 'ensayo') {
    const personajesUnicos = Array.from(new Set(entradas.filter(e => e.tipo === 'dialogo').map(e => e.personaje)));

    const filtro = document.createElement("div");
    filtro.className = "filtro-ensayo";
    filtro.innerHTML = "<strong>Ocultar personajes:</strong><br>";
    personajesUnicos.forEach(p => {
      const id = `chk-${normalizar(p)}`;
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" id="${id}" ${personajesOcultos.has(p) ? 'checked' : ''}/> ${p}`;
      label.style.marginRight = "1rem";
      filtro.appendChild(label);

      label.querySelector("input").addEventListener("change", (e) => {
        if (e.target.checked) personajesOcultos.add(p);
        else personajesOcultos.delete(p);
        mostrarVista();
      });
    });
    main.appendChild(filtro);
  }

  if (vistaActual === 'guion' || vistaActual === 'ensayo') {
    const container = document.createElement("div");
    container.className = vistaActual;
    entradas.forEach(linea => {
      if (linea.tipo === 'acotacion') {
        const p = document.createElement("div");
        p.className = vistaActual + "-acotacion";
        p.innerHTML = linea.texto.replace(/\n/g, "<br>");
        container.appendChild(p);
      } else {
        const p = document.createElement("div");
        p.className = `${vistaActual}-linea ${normalizar(linea.personaje)}`;
        if (vistaActual === 'ensayo' && personajesOcultos.has(linea.personaje)) {
          p.classList.add("oculto");
        }
        p.innerHTML = `<strong>${linea.personaje}</strong>:<br>${linea.texto.replace(/\n/g, "<br>")}`;
        container.appendChild(p);
      }
    });
    main.appendChild(container);
  }

  if (vistaActual === 'chat') {
    const div = document.createElement("div");
    div.className = "chat";
    entradas.forEach(linea => {
      if (linea.tipo === 'acotacion') {
        const ac = document.createElement("div");
        ac.className = "chat-acotacion";
        ac.innerHTML = linea.texto.replace(/\n/g, "<br>");
        div.appendChild(ac);
      } else {
        const bubble = document.createElement("div");
        bubble.className = `bubble ${normalizar(linea.personaje)}`;
        bubble.innerHTML = `<strong>${linea.personaje}:</strong><br>${linea.texto.replace(/\n/g, "<br>")}`;
        div.appendChild(bubble);
      }
    });
    main.appendChild(div);
  }
}

function parsearBloques(bloque) {
  const lineas = bloque.split('\n');
  const resultado = [];
  let actual = null;

  for (let linea of lineas) {
    linea = linea.trim();
    if (linea.startsWith('//')) {
      resultado.push({ tipo: 'acotacion', texto: linea.substring(2).trim() });
      continue;
    }

    const match = linea.match(/^\[([A-ZÁÉÍÓÚÑÜ\s]+)\]$/);
    if (match) {
      actual = { tipo: 'dialogo', personaje: match[1].trim(), texto: '' };
      resultado.push(actual);
    } else if (actual) {
      actual.texto += (actual.texto ? '\n' : '') + linea;
    }
  }

  return resultado;
}

function normalizar(nombre) {
  return nombre.toLowerCase().replaceAll(' ', '-').replaceAll('ñ','n');
}

cargarTexto();

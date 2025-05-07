let bloquesPorNumero = {};
let ordenNumeros = [];
let vistaActual = 'guion';
let numeroSeleccionado = 'todo';
let personajesOcultos = new Set();
let rachaGlobal = 0;


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

      const matchMusical = linea.match(/^###\s+(Nº?[\dA-Z]+)\s*🎵/i);
      const matchHablado = linea.match(/^###\s+▪️\s*(\d+)[\)]?/i);

      if (matchMusical) {
        numeroActual = matchMusical[1].replace(/^Nº/i, '').replace(/\s+/g, '').toLowerCase();
        ordenNumeros.push({ id: numeroActual, label: `${matchMusical[1]} 🎵` });
      } else if (matchHablado) {
        numeroActual = `t${matchHablado[1]}`;
        ordenNumeros.push({ id: numeroActual, label: '▪️' });
      }

      bloquesPorNumero[numeroActual] = '';
      continue;
    }

    textoBloque += linea + '\n';
  }

  bloquesPorNumero[numeroActual] += textoBloque;

  construirMenu();
  mostrarVista();
}

function construirMenu() {
  const menu = document.getElementById('menu-scroll');
  menu.innerHTML = '';

  // Crear botón "LF" para mostrar todo
  const botonTodo = document.createElement('button');
  botonTodo.textContent = 'LF';
  botonTodo.dataset.numero = 'todo'; // Asignar data-numero
  botonTodo.onclick = () => { filtrarPorNumero('todo'); };
  menu.appendChild(botonTodo);

  // Función para agregar separadores
  const separador = () => {
    const span = document.createElement('span');
    span.textContent = '  '; // Dos espacios como separador
    menu.appendChild(span);
  };

  separador();

  // Crear botones para cada número en ordenNumeros
  ordenNumeros.forEach((num, i) => {
    const btn = document.createElement('button');
    btn.textContent = num.label;
    btn.dataset.numero = num.id; // Asignar data-numero
    btn.onclick = () => { filtrarPorNumero(num.id); };
    menu.appendChild(btn);
    if ((i + 1) % 15 === 0) separador();
  });

  // Actualizar la clase 'activo' en los botones
  actualizarBotonesMenu();
}

function filtrarPorNumero(num) {
  numeroSeleccionado = num;
  actualizarBotonesMenu(); // NUEVO
  mostrarVista();
}

function actualizarBotonesMenu() {
  const botones = document.querySelectorAll('#menu-scroll button');
  botones.forEach(btn => {
    const id = btn.dataset.numero;
    if (id === numeroSeleccionado) {
      btn.classList.add('activo');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      btn.classList.remove('activo');
    }
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
    ? ordenNumeros.map(n => bloquesPorNumero[n.id] || '').join('\n\n')
    : bloquesPorNumero[numeroSeleccionado] || 'Contenido no encontrado.';

  const entradas = parsearBloques(bloques);

  if (vistaActual === 'ensayo') {
    const personajesUnicos = Array.from(new Set(
      entradas.filter(e => e.tipo === 'dialogo').map(e => e.personaje)
    ));

    const filtro = document.createElement("div");
    filtro.className = "filtro-ensayo";

    const panel = document.createElement("div");
    panel.id = "panel-personajes";
    panel.style.display = "none";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "👥 Ocultar personajes";
    toggleBtn.className = "toggle-ensayo";
    toggleBtn.onclick = () => {
      panel.style.display = panel.style.display === "none" ? "flex" : "none";
    };
    filtro.appendChild(toggleBtn);

    personajesUnicos.forEach(p => {
      const id = `chk-${normalizar(p)}`;
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" id="${id}" ${personajesOcultos.has(p) ? 'checked' : ''}/> ${p}`;
      panel.appendChild(label);

      label.querySelector("input").addEventListener("change", (e) => {
        if (e.target.checked) {
          personajesOcultos.add(p);
        } else {
          personajesOcultos.delete(p);
        }

        document.querySelectorAll(`.${normalizar(p)}`).forEach(el => {
          if (vistaActual === 'ensayo') {
            if (personajesOcultos.has(p)) {
              el.classList.add("oculto");
              el.innerHTML = `<strong>${p}</strong>:<br><em>— intervención oculta —</em>`;
              el.dataset.textoOriginal = el.dataset.textoOriginal || el.innerHTML;
            } else {
              el.classList.remove("oculto");
              el.innerHTML = `<strong>${p}</strong>:<br>${(el.dataset.textoOriginal || '').replace(/\n/g, "<br>")}`;
            }
          }
        });
      });
    });

    filtro.appendChild(panel);
    main.appendChild(filtro);
  }

  if (vistaActual === 'guion' || vistaActual === 'ensayo') {
    const container = document.createElement("div");
    container.className = vistaActual;

    entradas.forEach(linea => {
      const p = document.createElement("div");

      if (linea.tipo === 'acotacion') {
        p.className = vistaActual + "-acotacion";
        p.innerHTML = linea.texto.replace(/\n/g, "<br>");
      } else {
        p.className = `${vistaActual}-linea ${normalizar(linea.personaje)}`;
        p.dataset.personaje = linea.personaje;
        p.dataset.textoOriginal = linea.texto;

        const renderContenido = (visible) => {
          if (visible) {
            p.innerHTML = `<strong>${linea.personaje}</strong>:<br>${linea.texto.replace(/\n/g, "<br>")}`;
            p.classList.remove("oculto");
            p.classList.remove("revelado");
          } else {
            p.innerHTML = `<strong>${linea.personaje}</strong>:<br><em>— intervención oculta —</em>`;
            p.classList.add("oculto");
            p.classList.remove("revelado");
          }
        };

        if (vistaActual === 'ensayo' && personajesOcultos.has(linea.personaje)) {
          renderContenido(false);
        } else {
          renderContenido(true);
        }

        if (vistaActual === 'ensayo') {
          p.addEventListener("click", () => {
            const visible = p.classList.contains("revelado") || !p.classList.contains("oculto");
            renderContenido(!visible);
            if (!visible) p.classList.add("revelado");
          });
        }
      }

      container.appendChild(p);
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

  if (vistaActual === 'sigue') {
    const container = document.createElement("div");
    container.className = "sigue";

    const barraRacha = document.createElement("div");
    barraRacha.className = "racha-barra";
    barraRacha.innerHTML = '🔥 Racha: <span id="racha-valor">' + rachaGlobal + '</span>';
    container.appendChild(barraRacha);

    
    const soloDialogos = [];
    ordenNumeros.forEach(num => {
      const texto = bloquesPorNumero[num.id];
      const entradas = parsearBloques(texto);
      entradas.forEach(e => {
        if (e.tipo === 'dialogo') soloDialogos.push(e);
      });
    });

    if (soloDialogos.length < 2) {
      container.textContent = "No hay suficientes datos.";
      main.appendChild(container);
      return;
    }

     // Elegir una intervención aleatoria y su continuación
    const idx = Math.floor(Math.random() * (soloDialogos.length - 1));
    const actual = soloDialogos[idx];
    const siguiente = soloDialogos[idx + 1];

    // Elegir 3 distracciones aleatorias
    const distracciones = soloDialogos
      .filter((_, i) => i !== idx + 1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const opciones = [...distracciones, siguiente].sort(() => Math.random() - 0.5);

    // 👉 Texto: "Después de la frase:"
    const etiquetaAnterior = document.createElement("div");
    etiquetaAnterior.className = "sigue-etiqueta";
    etiquetaAnterior.textContent = "Después de la frase:";
    container.appendChild(etiquetaAnterior);

    // Mostrar frase actual
    const frase = document.createElement("div");
    frase.className = `sigue-linea ${normalizar(actual.personaje)}`;
    frase.innerHTML = `<strong>${actual.personaje}</strong>:<br>${actual.texto}`;
    container.appendChild(frase);

    // 👉 Texto: "Sigue la frase:"
    const etiquetaOpciones = document.createElement("div");
    etiquetaOpciones.className = "sigue-etiqueta";
    etiquetaOpciones.textContent = "Sigue la frase:";
    container.appendChild(etiquetaOpciones);

    // Mostrar opciones
    const opcionesGrid = document.createElement("div");
    opcionesGrid.className = "sigue-opciones";
    let racha = parseInt(localStorage.getItem("racha") || "0");

    let bloqueado = false;
    
    opciones.forEach(op => {
      const opDiv = document.createElement("div");
      opDiv.className = `sigue-linea opcion ${normalizar(op.personaje)}`;
      opDiv.innerHTML = `<strong>${op.personaje}</strong>:<br>${op.texto.length > 180 ? op.texto.slice(0, 180) + '…' : op.texto}`;

      opDiv.addEventListener("click", () => {

        if (bloqueado) return;  // 🔒 Si ya se respondió, no hacer nada
        bloqueado = true;
        
        if (op === siguiente) {
          rachaGlobal++;
          
          opDiv.style.border = "4px solid green";
          alert("✅ ¡Correcto!");
        } else {
          rachaGlobal = 0;
          
          opDiv.style.border = "4px solid red";
          alert(`❌ Incorrecto. La respuesta correcta era:\n${siguiente.personaje}: ${siguiente.texto}`);
        }
        document.getElementById("racha-valor").textContent = rachaGlobal;
      });

      opcionesGrid.appendChild(opDiv);
    });

    container.appendChild(opcionesGrid);

    // Botón para nueva pregunta

    const siguienteBtn = document.createElement("button");
    siguienteBtn.textContent = "🎲 Otra";
    siguienteBtn.className = "btn-siguiente";
    siguienteBtn.onclick = () => mostrarVista(); // Recarga
  
    container.appendChild(siguienteBtn);
    container.appendChild(barraRacha);


    main.appendChild(container);
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

    const match = linea.match(/^\[([\wÁÉÍÓÚÑÜáéíóúñü\sº°.,'-]+)\]$/);
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

const videos = {
  R: "Ol7eh5jkHKE",
  Z: "aJ45UuPGRo4"
};



cargarTexto();

function navegarADireccion(direccion) {
  let indexActual = ordenNumeros.findIndex(n => n.id === numeroSeleccionado);

  if (numeroSeleccionado === 'todo') {
    numeroSeleccionado = direccion === 'anterior'
      ? ordenNumeros[ordenNumeros.length - 1].id  // Ir al 14
      : ordenNumeros[0].id;                        // Ir al 1a
    actualizarBotonesMenu();
    mostrarVista();
    return;
  }

  if (indexActual === -1) return;

  let nuevoIndex = direccion === 'anterior' ? indexActual - 1 : indexActual + 1;

  if (nuevoIndex < 0) {
    numeroSeleccionado = 'todo'; // De 1a a LF
  } else if (nuevoIndex >= ordenNumeros.length) {
    numeroSeleccionado = 'todo'; // De 14 a LF
  } else {
    numeroSeleccionado = ordenNumeros[nuevoIndex].id;
  }

  actualizarBotonesMenu();
  mostrarVista();
}



let reproductorVisible = true;

function reproducir(version) {
  const claveLimpia = numeroSeleccionado.toLowerCase().replace(/^nº/, '');
  const clave = Object.keys(tiemposPorNumero).find(
    k => k.toLowerCase() === claveLimpia
  );

  const contenedor = document.getElementById("reproductor");

  // Si no hay tiempo para esta clave/version, vaciar
  if (!clave || !tiemposPorNumero[clave] || tiemposPorNumero[clave][version] === undefined) {
    contenedor.innerHTML = "";
    contenedor.removeAttribute("data-clave");
    reproductorVisible = false;
    ajustarAlturaMain();
    return;
  }

  const tiempoInicio = tiemposPorNumero[clave][version];
  const videoId = videos[version];
  const nuevaClave = clave + version;

  // Si ya está el mismo video activo, cerrar
  if (contenedor.dataset.clave === nuevaClave) {
    contenedor.innerHTML = "";
    contenedor.removeAttribute("data-clave");
    contenedor.classList.remove("colapsado");
    reproductorVisible = false;
    ajustarAlturaMain();
    return;
  }

  // Si es un nuevo video, mostrarlo
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?start=${tiempoInicio}&autoplay=1`;
  iframe.allow = "autoplay; encrypted-media";
  iframe.frameBorder = "0";
  iframe.width = "100%";
  iframe.height = "360"; // puedes ajustar el alto si lo deseas

  contenedor.innerHTML = "";
  contenedor.dataset.clave = nuevaClave;
  contenedor.appendChild(iframe);
  contenedor.classList.remove("colapsado");
  reproductorVisible = true;
  ajustarAlturaMain();
}


function toggleReproductor() {
  const contenedor = document.getElementById("reproductor");
  contenedor.classList.toggle("colapsado");
  ajustarAlturaMain();
}

function ajustarAlturaMain() {
  const fijo = document.getElementById("fijo");
  const main = document.querySelector("main");
  const altura = fijo.offsetHeight;
  main.style.setProperty('--fijo-altura', altura + 'px');
}

window.addEventListener("load", ajustarAlturaMain);
window.addEventListener("resize", ajustarAlturaMain);

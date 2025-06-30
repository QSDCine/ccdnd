// Variables globales
let combatientes = [];
let turnoActual = 1;
let indiceActual = 0;
let combatienteSeleccionado = null;

// Elementos del DOM
const estadoTurnoEl = document.getElementById("estado-turno");
const nombreTurnoEl = document.getElementById("nombre-turno");
const listaCombatientesEl = document.getElementById("lista-combatientes");
const registroEl = document.getElementById("registro");
const valorModEl = document.getElementById("valor-modificador");
const botonCurar = document.getElementById("boton-curar");
const botonDanar = document.getElementById("boton-danar");
const pasarTurnoBtn = document.getElementById("pasar-turno");
const finalizarBtn = document.getElementById("finalizar-combate");
const resultadoAccion = document.getElementById("resultado-accion");

// Función para cargar datos
function cargarDatos() {
  combatientes = JSON.parse(localStorage.getItem("combatientes")) || [];
  turnoActual = parseInt(localStorage.getItem("turnoActual")) || 1;
  indiceActual = parseInt(localStorage.getItem("indiceActual")) || 0;
combatientes.forEach(c => {
  if (c.caOriginal === undefined) c.caOriginal = c.ca;
  if (c.ventaja === undefined) c.ventaja = false;
  if (c.desventaja === undefined) c.desventaja = false;
  if (c.exitosMuerte === undefined) c.exitosMuerte = 0;
    if (c.fallosMuerte === undefined) c.fallosMuerte = 0;
    if (c.muerto === undefined) c.muerto = false;
if (c.estadoAlterado === undefined) c.estadoAlterado = null;
});
}

// Mostrar lista de combatientes
function renderCombatientes() {
  listaCombatientesEl.innerHTML = "";

  combatientes.forEach((c, index) => {
    const div = document.createElement("div");
    div.classList.add("combatiente");
if (index === indiceActual) div.classList.add("activo");
if (index === combatienteSeleccionado) div.classList.add("seleccionado");
if (c.pgActual <= 0) div.classList.add("caido");


    const caMostrada = (c.ca !== undefined && c.ca !== null) ? c.ca : "-";

   const muerteIconos = c.pgActual === 0 && c.tipo === "jugador"
  ? " " + "✅".repeat(c.exitosMuerte || 0) + "❌".repeat(c.fallosMuerte || 0)
  : "";

const estadoTexto = c.estadoAlterado ? `⚠️ ${c.estadoAlterado.nombre} (${c.estadoAlterado.turnos})` : '';


div.innerHTML = `
  <strong style="color:${c.tipo === 'enemigo' ? 'darkblue' : 'black'}">
    ${index + 1}.– ${c.nombre}
  ${c.muerto ? '💀' : ''}
    ${c.ventaja ? '🟢V' : ''}
    ${c.desventaja ? '🔴D' : ''}
      </strong>
  <span class="iconos-muerte">${(c.tipo === 'jugador' && c.pgActual === 0) ? `${'✅'.repeat(c.exitosMuerte || 0)}${'❌'.repeat(c.fallosMuerte || 0)}` : ''}</span>
  <br>
  PG: ${c.pgActual} / ${c.pgMaximos} | CA: ${caMostrada} ${estadoTexto ? `| ${estadoTexto}` : ''}

`;



    div.addEventListener("click", () => {
      combatienteSeleccionado = index;
      resultadoAccion.textContent = `Seleccionado: ${combatientes[index].nombre}`;
      renderCombatientes(); 
    });

    listaCombatientesEl.appendChild(div);
if (index === combatienteSeleccionado && c.tipo === "jugador" && !c.muerto) {
  if (c.pgActual === 0) {
    controlesMuerte.classList.add("mostrar-muerte");



    if (!c.exitosMuerte) c.exitosMuerte = 0;
    if (!c.fallosMuerte) c.fallosMuerte = 0;


  } else {
    controlesMuerte.classList.remove("mostrar-muerte");
  }
}
  });
}


// Mostrar estado del turno
function actualizarTurno() {
  const actual = combatientes[indiceActual];
  nombreTurnoEl.textContent = actual.nombre;
  estadoTurnoEl.innerHTML = `Turno ${turnoActual} - Turno de <span id="nombre-turno">${actual.nombre}</span>`;
}

// Registrar acción en historial
function registrar(mensaje) {
  const p = document.createElement("p");
  p.textContent = mensaje;
  registroEl.appendChild(p);
  registroEl.scrollTop = registroEl.scrollHeight;
}

// Aplicar curación o daño
function modificarHP(cantidad) {
  if (combatienteSeleccionado === null) {
    resultadoAccion.textContent = "Selecciona un combatiente primero.";
    return;
  }

  const c = combatientes[combatienteSeleccionado];
  const anterior = c.pgActual;

  c.pgActual += cantidad;
  if (c.pgActual > c.pgMaximos) c.pgActual = c.pgMaximos;
  if (c.pgActual < 0) c.pgActual = 0;

  // Si estaba muerto y ahora tiene más de 0 PG, lo revivimos
  if (c.muerto && c.pgActual > 0) {
    c.muerto = false;
    c.exitosMuerte = 0;
    c.fallosMuerte = 0;
    registrar(`${c.nombre} ha sido resucitado y vuelve al combate.`);
  }

  const tipo = cantidad > 0 ? "cura" : "daño";
  registrar(`Turno ${turnoActual} - ${c.nombre} recibe ${Math.abs(cantidad)} de ${tipo} (${anterior} ➞ ${c.pgActual})`);
  resultadoAccion.textContent = `${c.nombre}: ${tipo} aplicado`;

  if (c.pgActual === 0 && c.tipo === "jugador") {
    controlesMuerte.classList.add("mostrar-muerte");
    actualizarEstadoMuerte(c);
  } else {
    controlesMuerte.classList.remove("mostrar-muerte");
  }

  renderCombatientes();
  combatienteSeleccionado = combatientes.findIndex(x => x === c);
}


// Pasar al siguiente turno
function pasarTurno() {
  let intentos = 0;
  const maxIntentos = combatientes.length;

  do {
    indiceActual++;
    if (indiceActual >= combatientes.length) {
      indiceActual = 0;
      turnoActual++;
    }

    const actual = combatientes[indiceActual];
if (actual.estadoAlterado) {
  actual.estadoAlterado.turnos--;
  if (actual.estadoAlterado.turnos <= 0) {
    registrar(`${actual.nombre} ya no está bajo el efecto de "${actual.estadoAlterado.nombre}".`);
    actual.estadoAlterado = null;
  }
}
    if (!actual.muerto && (actual.pgActual > 0 || actual.tipo === "jugador")) break;


    intentos++;
  } while (intentos < maxIntentos);

  localStorage.setItem("indiceActual", indiceActual.toString());
  localStorage.setItem("turnoActual", turnoActual.toString());

  combatienteSeleccionado = null;
  resultadoAccion.textContent = "";
  actualizarTurno();
  renderCombatientes();
}


// Finalizar combate
function finalizarCombate() {
  // Guardar PG de los jugadores
  const jugadoresActualizados = combatientes
    .filter(c => c.tipo === "jugador")
    .map(c => ({
      nombre: c.nombre,
      pgMaximos: c.pgMaximos,
      pgActual: c.pgActual,
      ca: c.caOriginal !== undefined ? c.caOriginal : c.ca
    }));

  localStorage.setItem("jugadores", JSON.stringify(jugadoresActualizados));
  localStorage.removeItem("combatientes");
  localStorage.removeItem("turnoActual");
  localStorage.removeItem("indiceActual");
  window.location.href = "foes.html";
}

// Eventos
botonCurar.addEventListener("click", () => {
  const cantidad = parseInt(valorModEl.value);
  if (!isNaN(cantidad)) modificarHP(Math.abs(cantidad));
});

botonDanar.addEventListener("click", () => {
  const cantidad = parseInt(valorModEl.value);
  if (!isNaN(cantidad)) modificarHP(-Math.abs(cantidad));
});

pasarTurnoBtn.addEventListener("click", pasarTurno);
finalizarBtn.addEventListener("click", finalizarCombate);

const valorCaEl = document.getElementById("valor-ca");
const botonCambiarCa = document.getElementById("boton-cambiar-ca");

botonCambiarCa.addEventListener("click", () => {
  if (combatienteSeleccionado === null) {
    resultadoAccion.textContent = "Selecciona un combatiente primero.";
    return;
  }

  const nuevaCa = parseInt(valorCaEl.value);
  if (!isNaN(nuevaCa)) {
    combatientes[combatienteSeleccionado].ca = nuevaCa;
    resultadoAccion.textContent = `${combatientes[combatienteSeleccionado].nombre}: CA actualizada a ${nuevaCa}`;
    renderCombatientes();
    valorCaEl.value = ""; // Vacía el input tras actualizar la CA

  } else {
    resultadoAccion.textContent = "Introduce un número válido para la CA.";
  }
});
// BOTON VENTAJA/DESVENTAJA
const botonVentajaDesventaja = document.getElementById("boton-ventaja-desventaja");

botonVentajaDesventaja.addEventListener("click", () => {
  if (combatienteSeleccionado === null) {
    resultadoAccion.textContent = "Selecciona un combatiente primero.";
    return;
  }

  const c = combatientes[combatienteSeleccionado];

  if (!c.ventaja && !c.desventaja) {
    c.ventaja = true;
    resultadoAccion.textContent = `${c.nombre}: Ventaja activada`;
  } else if (c.ventaja) {
    c.ventaja = false;
    c.desventaja = true;
    resultadoAccion.textContent = `${c.nombre}: Desventaja activada`;
  } else {
    c.desventaja = false;
    resultadoAccion.textContent = `${c.nombre}: Sin ventaja ni desventaja`;
  }

  renderCombatientes();
});

const botonExito = document.getElementById("boton-exito");
const botonFallo = document.getElementById("boton-fallo");
const estadoMuerteEl = document.getElementById("estado-muerte");
const controlesMuerte = document.getElementById("muerte-controls");

function actualizarEstadoMuerte(combatiente) {
  combatienteSeleccionado = combatientes.findIndex(x => x === combatiente);
  combatiente.exitosMuerte = combatiente.exitosMuerte || 0;
  combatiente.fallosMuerte = combatiente.fallosMuerte || 0;

  if (combatiente.fallosMuerte >= 3 && !combatiente.muerto) {
    combatiente.muerto = true;
    registrar(`${combatiente.nombre} ha muerto.`);
    controlesMuerte.classList.remove("mostrar-muerte");
    combatiente.exitosMuerte = 0;
    combatiente.fallosMuerte = 3;
  }

  else if (combatiente.exitosMuerte >= 3 && !combatiente.muerto) {
    combatiente.pgActual = 1;
    combatiente.muerto = false;
    registrar(`${combatiente.nombre} se estabiliza.`);
    controlesMuerte.classList.remove("mostrar-muerte");
    combatiente.exitosMuerte = 0;
    combatiente.fallosMuerte = 0;
  }

  renderCombatientes();
}



botonExito.addEventListener("click", () => {
  if (combatienteSeleccionado === null) return;

  const c = combatientes[combatienteSeleccionado];
  if (c.pgActual > 0 || c.tipo !== "jugador" || c.muerto) return;

  c.exitosMuerte++;
  actualizarEstadoMuerte(c);
});

botonFallo.addEventListener("click", () => {
  if (combatienteSeleccionado === null) return;

  const c = combatientes[combatienteSeleccionado];
  if (c.pgActual > 0 || c.tipo !== "jugador" || c.muerto) return;

  c.fallosMuerte++;
  actualizarEstadoMuerte(c);
});

// Estados alterados:

const botonEstado = document.getElementById("boton-estado");
const botonQuitarEstado = document.getElementById("boton-quitar-estado");
const inputNombreEstado = document.getElementById("nombre-estado");
const inputTurnosEstado = document.getElementById("turnos-estado");

botonEstado.addEventListener("click", () => {
  if (combatienteSeleccionado === null) {
    resultadoAccion.textContent = "Selecciona un combatiente primero.";
    return;
  }

  const nombre = inputNombreEstado.value.trim();
  const turnos = parseInt(inputTurnosEstado.value);

  if (!nombre || isNaN(turnos) || turnos <= 0) {
    resultadoAccion.textContent = "Introduce un nombre y duración válida.";
    return;
  }

  const c = combatientes[combatienteSeleccionado];
  c.estadoAlterado = { nombre, turnos };
  registrar(`${c.nombre} está ahora bajo el efecto de "${nombre}" durante ${turnos} turnos.`);

  inputNombreEstado.value = "";
  inputTurnosEstado.value = "";
  renderCombatientes();
});

botonQuitarEstado.addEventListener("click", () => {
  if (combatienteSeleccionado === null) {
    resultadoAccion.textContent = "Selecciona un combatiente primero.";
    return;
  }

  const c = combatientes[combatienteSeleccionado];

  if (!c.estadoAlterado) {
    resultadoAccion.textContent = `${c.nombre} no tiene estado alterado.`;
    return;
  }

  registrar(`${c.nombre} ya no está bajo el efecto de "${c.estadoAlterado.nombre}".`);
  c.estadoAlterado = null;
  renderCombatientes();
});



// Init
cargarDatos();
actualizarTurno();
renderCombatientes();

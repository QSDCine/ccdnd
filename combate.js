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

div.innerHTML = `
  <strong style="color:${c.tipo === 'enemigo' ? 'darkblue' : 'black'}">
    ${index + 1}.– ${c.nombre}
  ${c.muerto ? '💀' : ''}
    ${c.ventaja ? '🟢V' : ''}
    ${c.desventaja ? '🔴D' : ''}
      </strong>
  <span class="iconos-muerte">${(c.tipo === 'jugador' && c.pgActual === 0) ? `${'✅'.repeat(c.exitosMuerte || 0)}${'❌'.repeat(c.fallosMuerte || 0)}` : ''}</span>
  <br>
  PG: ${c.pgActual} / ${c.pgMaximos} | CA: ${caMostrada}
`;



    div.addEventListener("click", () => {
      combatienteSeleccionado = index;
      resultadoAccion.textContent = `Seleccionado: ${combatientes[index].nombre}`;
      renderCombatientes(); // vuelve a pintar todos y actualiza el resaltado
    });

    listaCombatientesEl.appendChild(div);
    if (index === combatienteSeleccionado && c.tipo === "jugador") {
  if (c.pgActual === 0) {
    controlesMuerte.classList.add("mostrar-muerte");


    if (!c.exitosMuerte) c.exitosMuerte = 0;
    if (!c.fallosMuerte) c.fallosMuerte = 0;

    actualizarEstadoMuerte(c);
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

  const tipo = cantidad > 0 ? "cura" : "daño";
  registrar(`Turno ${turnoActual} - ${c.nombre} recibe ${Math.abs(cantidad)} de ${tipo} (${anterior} ➞ ${c.pgActual})`);
  resultadoAccion.textContent = `${c.nombre}: ${tipo} aplicado`;

  renderCombatientes();


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
    if (actual.pgActual > 0 || actual.tipo === "jugador") break;

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
  combatiente.exitosMuerte = combatiente.exitosMuerte || 0;
  combatiente.fallosMuerte = combatiente.fallosMuerte || 0;

  const ex = "✅".repeat(combatiente.exitosMuerte);
  const fa = "❌".repeat(combatiente.fallosMuerte);
  estadoMuerteEl.textContent = `Tiradas de Muerte: ${ex} ${fa}`;

  if (combatiente.exitosMuerte >= 3 && !combatiente.muerto) {
    registrar(`${combatiente.nombre} se estabiliza.`);
    combatiente.pgActual = 1;
    combatiente.exitosMuerte = 0;
    combatiente.fallosMuerte = 0;
    combatiente.muerto = false;
    controlesMuerte.style.display = "none";
  } else if (combatiente.fallosMuerte >= 3 && !combatiente.muerto) {
    registrar(`${combatiente.nombre} ha muerto.`);
    combatiente.muerto = true;
    controlesMuerte.style.display = "none";
    combatiente.exitosMuerte = 0;
    combatiente.fallosMuerte = 3;
  }

  renderCombatientes(); 
}


botonExito.addEventListener("click", () => {
  if (combatienteSeleccionado === null) return;

  const c = combatientes[combatienteSeleccionado];
  if (c.pgActual > 0 || c.tipo !== "jugador") return;

  c.exitosMuerte = (c.exitosMuerte || 0) + 1;
  actualizarEstadoMuerte(c);
});

botonFallo.addEventListener("click", () => {
  if (combatienteSeleccionado === null) return;

  const c = combatientes[combatienteSeleccionado];
  if (c.pgActual > 0 || c.tipo !== "jugador") return;

  c.fallosMuerte = (c.fallosMuerte || 0) + 1;
  actualizarEstadoMuerte(c);
});


// Init
cargarDatos();
actualizarTurno();
renderCombatientes();

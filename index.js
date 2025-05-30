document.getElementById("generarCampos").addEventListener("click", () => {
    let numJugadores = parseInt(document.getElementById("numJugadores").value, 10);
    let camposJugadores = document.getElementById("camposJugadores");

    if (numJugadores > 0) {
        camposJugadores.innerHTML = ""; // Limpiar campos previos

        for (let i = 0; i < numJugadores; i++) {
            let div = document.createElement("div");
            div.innerHTML = `
                <label>Jugador ${i + 1}:</label>
                <input type="text" placeholder="Nombre" class="nombreJugador">
                <input type="number" placeholder="PG máximos" class="pgMaxJugador">
                <input type="number" placeholder="PG actuales" class="pgActualJugador">
                <input type="number" placeholder="CA" class="caJugador">
            `;
            camposJugadores.appendChild(div);
        }

        document.getElementById("continuar").style.display = "block";
    } else {
        alert("Por favor, ingresa un número válido de jugadores.");
    }
});

document.getElementById("continuar").addEventListener("click", () => {
    let nombres = document.querySelectorAll(".nombreJugador");
    let pgMaximos = document.querySelectorAll(".pgMaxJugador");
    let pgActuales = document.querySelectorAll(".pgActualJugador");
    let cas = document.querySelectorAll(".caJugador");

    let jugadores = [];

    nombres.forEach((nombreInput, index) => {
        let nombre = nombreInput.value.trim();
        let pgMax = parseInt(pgMaximos[index].value, 10);
        let pgAct = parseInt(pgActuales[index].value, 10);
        let ca = parseInt(cas[index].value, 10);

        if (nombre && !isNaN(pgMax) && !isNaN(pgAct) && !isNaN(ca)) {
            jugadores.push({
                nombre: nombre,
                pgMaximos: pgMax,
                pgActual: pgAct,
                ca: ca,
                caOriginal: ca,
                tipo: "jugador"
            });
        }
    });

    if (jugadores.length > 0) {
        localStorage.setItem("jugadores", JSON.stringify(jugadores));
        window.location.href = "foes.html";
    } else {
        alert("Introduce todos los datos correctamente.");
    }
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(() => {
      console.log("SW registrado correctamente");
    }).catch((err) => {
      console.error("Error al registrar el SW:", err);
    });
  });
}


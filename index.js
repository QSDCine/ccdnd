document.getElementById("generarCampos").addEventListener("click", () => {
    let numJugadores = document.getElementById("numJugadores").value;
    let camposJugadores = document.getElementById("camposJugadores");

    if (numJugadores > 0) {
        camposJugadores.innerHTML = ""; // Limpiar en caso de cambios
        for (let i = 0; i < numJugadores; i++) {
            let div = document.createElement("div");
            div.innerHTML = `
                        <label>Jugador ${i + 1}:</label>
                        <input type="text" placeholder="Nombre" class="nombreJugador">
                        <input type="number" placeholder="Puntos de golpe" class="pgJugador">
                    `;
            camposJugadores.appendChild(div);
        }
        document.getElementById("continuar").style.display = "block"; // Mostrar botón
    } else {
        alert("Por favor, ingresa un número válido de jugadores.");
    }
});

document.getElementById("continuar").addEventListener("click", () => {
    let nombres = document.querySelectorAll(".nombreJugador");
    let puntosGolpe = document.querySelectorAll(".pgJugador");
    let jugadores = [];

    nombres.forEach((nombre, index) => {
        let nombreValor = nombre.value.trim();
        let puntosGolpeValor = parseInt(puntosGolpe[index].value, 10);

        if (nombreValor !== "" && !isNaN(puntosGolpeValor) && puntosGolpeValor > 0) {
            jugadores.push({
                nombre: nombreValor,
                pgMaximos: puntosGolpeValor
            });
        }
    });

    if (jugadores.length > 0) {
        localStorage.setItem("jugadores", JSON.stringify(jugadores));
        console.log("Jugadores guardados correctamente:", localStorage.getItem("jugadores"));


        localStorage.setItem("jugadores", JSON.stringify(jugadores));
        window.location.href = "foes.html";
    } else {
        alert("Por favor, introduce nombres y puntos de golpe válidos.");
    }
});

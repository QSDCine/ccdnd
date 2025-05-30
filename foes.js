document.addEventListener("DOMContentLoaded", () => {
    let jugadoresGuardados = localStorage.getItem("jugadores");

    if (!jugadoresGuardados || jugadoresGuardados === "[]") { 
        console.warn("No se encontraron jugadores en localStorage.");
        return;
    }

    let jugadores = [];
    try {
        jugadores = JSON.parse(jugadoresGuardados);
    } catch (e) {
        console.error("Error al parsear los datos de jugadores:", e);
        return;
    }

    let camposAliados = document.getElementById("camposAliados");

    jugadores.forEach((jugador) => {
        let div = document.createElement("div");
        div.innerHTML = `
            <label>${jugador.nombre}:</label>
            <input type="number" placeholder="Iniciativa" class="iniJugador">
        `;
        camposAliados.appendChild(div);
    });
});


document.getElementById("generarCampos").addEventListener("click", () => {
    let numEnemigos = document.getElementById("numEnemigos").value;
    let camposEnemigos = document.getElementById("camposEnemigos");

    if (numEnemigos > 0) {
        camposEnemigos.innerHTML = ""; // Limpiar en caso de cambios
        for (let i = 0; i < numEnemigos; i++) {
            let div = document.createElement("div");
            div.innerHTML = `
                <label>Enemigo ${i + 1}:</label>
                <input type="text" placeholder="Nombre" class="nombreEnemigo">
                <input type="number" placeholder="Puntos de golpe" class="pgEnemigo">
                <input type="number" placeholder="Iniciativa" class="iniEnemigo">
            `;
            camposEnemigos.appendChild(div);
        }
        document.getElementById("continuar").style.display = "block"; // Mostrar botón
    } else {
        alert("Por favor, ingresa un número válido de enemigos.");
    }
});


document.getElementById("continuar").addEventListener("click", () => {
    let nombres = document.querySelectorAll(".nombreEnemigo");
    let puntosGolpe = document.querySelectorAll(".pgEnemigo");
    let iniciativas = document.querySelectorAll(".iniEnemigo");

    let enemigos = [];

    nombres.forEach((nombre, index) => {
        let nombreValor = nombre.value.trim();
        let pg = parseInt(puntosGolpe[index].value);
        let ini = parseInt(iniciativas[index].value);

        if (nombreValor !== "" && !isNaN(pg) && !isNaN(ini)) {
            enemigos.push({
                nombre: nombreValor,
                pgMaximos: pg,
                pgActual: pg,
                iniciativa: ini,
                tipo: "enemigo"
            });
        }
    });

    // Obtener jugadores con iniciativa
    let camposIniciativas = document.querySelectorAll(".iniJugador");
    let jugadores = JSON.parse(localStorage.getItem("jugadores")) || [];

    jugadores.forEach((jugador, index) => {
        let ini = parseInt(camposIniciativas[index].value);
        jugador.iniciativa = isNaN(ini) ? 0 : ini;
        jugador.pgActual = jugador.pgActual ?? jugador.pgMaximos;
        jugador.tipo = "jugador";
    });

    // Combinar y ordenar
    let combatientes = [...jugadores, ...enemigos];
    combatientes.sort((a, b) => b.iniciativa - a.iniciativa);

    // Guardar y continuar
    localStorage.setItem("combatientes", JSON.stringify(combatientes));
    localStorage.setItem("turnoActual", "1");
    localStorage.setItem("indiceActual", "0");

    window.location.href = "combate.html";
});

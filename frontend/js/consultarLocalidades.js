// ---------------------------
// SCRIPT COMPLETO: FILTROS + CONSULTA BACKEND
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------
    // BLOQUE 0: VARIABLES GLOBALES
    // ---------------------------
    const filtrosContainer = document.getElementById("filtros-container");
    const agregarFiltroBtn = document.getElementById("agregarFiltro");
    const limpiarBtn = document.querySelector(".limpiar");
    const formFiltros = document.getElementById("formFiltros");
    const tablaBody = document.querySelector("#resultados-container tbody");

    const MAX_FILTROS = 5; // máximo de filtros permitidos

    // ---------------------------
    // BLOQUE 1: FUNCIONES FILTROS DINÁMICOS
    // ---------------------------

    /**
     * Crear un filtro dinámico (select + input + botón eliminar opcional)
     * @param {boolean} tieneEliminar - Si el filtro puede eliminarse
     * @returns {HTMLElement} divFiltro
     */
    function crearFiltro(tieneEliminar = true) {
        const divFiltro = document.createElement("div");
        divFiltro.classList.add("filtro-dinamico");

        // Contenedor select + input
        const campoContainer = document.createElement("div");
        campoContainer.classList.add("campo-container");

        // Select de tipo de filtro
        const select = document.createElement("select");
        select.name = "filtros[]";
        select.required = true;
        select.innerHTML = `
            <option value="">Selecciona un filtro</option>
            <option value="nombre_centro_trabajo">Nombre del centro de trabajo</option>
            <option value="localidad">Localidad</option>
            <option value="poblacion">Población</option>
            <option value="estado">Estado</option>
            <option value="tipo_instalacion">Tipo de instalación</option>
        `;

        // Input oculto inicialmente
        const input = document.createElement("input");
        input.type = "text";
        input.name = "valores[]";
        input.placeholder = "Ingrese valor";
        input.required = true;
        input.style.display = "none";

        // Mostrar input solo si se selecciona un filtro
        select.addEventListener("change", () => {
            input.style.display = select.value ? "block" : "none";
        });

        campoContainer.appendChild(select);
        campoContainer.appendChild(input);
        divFiltro.appendChild(campoContainer);

        // Botón eliminar (solo si tieneEliminar)
        if (tieneEliminar) {
            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("eliminar-filtro");

            btnEliminar.addEventListener("click", () => {
                filtrosContainer.removeChild(divFiltro);
                actualizarEstadoBotonAgregar();
            });

            divFiltro.appendChild(btnEliminar);
        }

        return divFiltro;
    }

    /**
     * Actualizar estado del botón "Agregar filtro"
     */
    function actualizarEstadoBotonAgregar() {
        const numFiltros = filtrosContainer.querySelectorAll(".filtro-dinamico").length;
        agregarFiltroBtn.disabled = numFiltros >= MAX_FILTROS;
        agregarFiltroBtn.style.opacity = numFiltros >= MAX_FILTROS ? "0.6" : "1";
        agregarFiltroBtn.style.cursor = numFiltros >= MAX_FILTROS ? "not-allowed" : "pointer";
    }

    // ---------------------------
    // BLOQUE 2: INICIALIZACIÓN DE FILTROS
    // ---------------------------
    // Primer filtro
    const filtroInicial = crearFiltro(false);
    filtrosContainer.appendChild(filtroInicial);
    actualizarEstadoBotonAgregar();

    // Agregar filtro dinámico
    agregarFiltroBtn.addEventListener("click", () => {
        if (filtrosContainer.querySelectorAll(".filtro-dinamico").length < MAX_FILTROS) {
            filtrosContainer.appendChild(crearFiltro(true));
            actualizarEstadoBotonAgregar();
        }
    });

    // ---------------------------
    // BLOQUE 3: LIMPIAR FILTROS CON SWEETALERT2
    // ---------------------------
    limpiarBtn.addEventListener("click", () => {
        Swal.fire({
            title: '¿Desea borrar los datos mostrados en pantalla?',
            text: 'Se perderán los filtros actuales.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'No, cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Limpiar tabla
                tablaBody.innerHTML = "";

                // Limpiar filtros y dejar solo el inicial
                filtrosContainer.innerHTML = "";
                const nuevoFiltroInicial = crearFiltro(false);
                filtrosContainer.appendChild(nuevoFiltroInicial);

                // Forzar input oculto del primer filtro
                const input = nuevoFiltroInicial.querySelector("input");
                if (input) input.style.display = "none";

                actualizarEstadoBotonAgregar();

                // Recarga opcional de todos los registros
                cargarTodos();

                Swal.fire({
                    icon: 'success',
                    title: 'Campos borrados correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    });

    // ---------------------------
    // BLOQUE 4: CONSULTA AL BACKEND
    // ---------------------------

    /**
     * Mostrar resultados en la tabla
     * @param {Array} data
     */
    function mostrarResultados(data) {
        tablaBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No se encontraron resultados</td></tr>`;
            return;
        }

        data.forEach(item => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.nombre_centro_trabajo || ""}</td>
                <td>${item.localidad || ""}</td>
                <td>${item.poblacion || ""}</td>
                <td>${item.estado || ""}</td>
                <td>${item.tipo_instalacion || ""}</td>
            `;
            tablaBody.appendChild(fila);
        });
    }

    /**
     * Consultar backend con los filtros enviados
     * @param {FormData} formData
     */
    function consultarBackend(formData) {
        fetch("/backend/consultaLocalidades.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(data => mostrarResultados(data))
        .catch(err => {
            console.error("Error al consultar:", err);
            tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error en la consulta</td></tr>`;
        });
    }

    /**
     * Cargar todos los registros sin filtros
     */
    function cargarTodos() {
        const formData = new FormData(); // vacío = sin filtros
        consultarBackend(formData);
    }

    // Consulta inicial
    cargarTodos();

    // Filtrar al enviar formulario
    formFiltros.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(formFiltros);
        consultarBackend(formData);
    });

    // Botón regresar
    const regresarBtn = document.querySelector(".regresar");
    if (regresarBtn) {
        regresarBtn.addEventListener("click", () => {
            window.location.href = "panel_general.html";
        });
    }

});

document.addEventListener("DOMContentLoaded", () => {

    // Elementos del DOM
    const inputId = document.getElementById("id_localidad");
    const inputNombre = document.getElementById("nombre_centro_trabajo");
    const inputLocalidad = document.getElementById("localidad");
    const inputPoblacion = document.getElementById("poblacion");
    const inputEstado = document.getElementById("estado");

    const btnBuscar = document.getElementById("btnBuscar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnCancelar = document.getElementById("btnCancelar");

    const seccionResultados = document.getElementById("resultsSection");
    const contenedorResultados = document.getElementById("resultsContainer");
    const seccionInfoLocalidad = document.getElementById("localidadInfoSection");

    // Campos de información
    const infoCampos = {
        id: document.getElementById("info_id"),
        nombre: document.getElementById("info_nombre_centro"),
        ubicacion: document.getElementById("info_ubicacion"),
        poblacion: document.getElementById("info_poblacion"),
        localidad: document.getElementById("info_localidad"),
        estado: document.getElementById("info_estado"),
        tipo: document.getElementById("info_tipo_instalacion")
    };

    let idLocalidadSeleccionada = null;

    // --------------------- FUNCIONES ---------------------

    // Mostrar alerta con Swal
    const mostrarAlerta = (titulo, texto, icono = "info") => {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            confirmButtonText: "Aceptar"
        });
    };

    // Limpiar campos y secciones
    const limpiarCampos = () => {
        inputId.value = "";
        inputNombre.value = "";
        inputLocalidad.value = "";
        inputPoblacion.value = "";
        inputEstado.value = "";

        seccionResultados.style.display = "none";
        contenedorResultados.innerHTML = "";
        seccionInfoLocalidad.style.display = "none";

        Object.values(infoCampos).forEach(campo => campo.textContent = "-");
        idLocalidadSeleccionada = null;
        btnEliminar.disabled = true;
    };

    // Mostrar información de la localidad seleccionada
    const mostrarInfoLocalidad = (datos) => {
        idLocalidadSeleccionada = datos.id;
        infoCampos.id.textContent = datos.id;
        infoCampos.nombre.textContent = datos.nombre_centro;
        infoCampos.ubicacion.textContent = datos.ubicacion || "-";
        infoCampos.poblacion.textContent = datos.poblacion || "-";
        infoCampos.localidad.textContent = datos.localidad || "-";
        infoCampos.estado.textContent = datos.estado || "-";
        infoCampos.tipo.textContent = datos.tipo_instalacion || "-";

        seccionInfoLocalidad.style.display = "block";
        btnEliminar.disabled = false;
    };

    // --------------------- EVENTOS ---------------------

    // Buscar localidad
    btnBuscar.addEventListener("click", () => {
        const formData = new FormData();
        formData.append("id_localidad", inputId.value);
        formData.append("nombre_centro_trabajo", inputNombre.value);
        formData.append("localidad", inputLocalidad.value);
        formData.append("poblacion", inputPoblacion.value);
        formData.append("estado", inputEstado.value);

        fetch("/backend/eliminarLocalidad.php", {
            method: "POST",
            body: formData
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.length === 0) {
                mostrarAlerta("Sin resultados", "No se encontraron localidades", "warning");
                seccionResultados.style.display = "none";
                return;
            }

            contenedorResultados.innerHTML = "";
            datos.forEach(localidad => {
                const div = document.createElement("div");
                div.classList.add("resultado-item");
                div.textContent = `${localidad.id} - ${localidad.nombre_centro} (${localidad.localidad})`;
                div.addEventListener("click", () => mostrarInfoLocalidad(localidad));
                contenedorResultados.appendChild(div);
            });

            seccionResultados.style.display = "block";
        })
        .catch(error => {
            console.error(error);
            mostrarAlerta("Error", "Ocurrió un error al buscar localidades", "error");
        });
    });

    // Limpiar campos
    btnLimpiar.addEventListener("click", () => {
        Swal.fire({
            title: "¿Desea limpiar los datos?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, limpiar",
            cancelButtonText: "Cancelar"
        }).then(resultado => {
            if (resultado.isConfirmed) limpiarCampos();
        });
    });

    // Cancelar operación
    btnCancelar.addEventListener("click", () => {
        Swal.fire({
            title: "¿Desea salir sin eliminar?",
            text: "Se perderán los datos cargados",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "No, permanecer"
        }).then(resultado => {
            if (resultado.isConfirmed) limpiarCampos();
        });
    });

    // Eliminar localidad
    btnEliminar.addEventListener("click", () => {
        if (!idLocalidadSeleccionada) return mostrarAlerta("Seleccione una localidad", "Debe seleccionar una localidad antes de eliminar", "warning");

        Swal.fire({
            title: "Confirmar eliminación",
            text: `¿Está seguro de eliminar la localidad "${infoCampos.nombre.textContent}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then(resultado => {
            if (!resultado.isConfirmed) return;

            const formData = new FormData();
            formData.append("id_localidad", idLocalidadSeleccionada);

            fetch("/backend/eliminarLocalidad.php", {
                method: "POST",
                body: formData
            })
            .then(respuesta => respuesta.json())
            .then(res => {
                mostrarAlerta(res.exito ? "Eliminado" : "Error", res.mensaje, res.exito ? "success" : "error");
                if (res.exito) limpiarCampos();
            })
            .catch(error => {
                console.error(error);
                mostrarAlerta("Error", "Ocurrió un error al eliminar la localidad", "error");
            });
        });
    });

});

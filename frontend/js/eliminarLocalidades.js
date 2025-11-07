document.addEventListener("DOMContentLoaded", () => {

    // --------------------- ELEMENTOS ---------------------
    const inputId = document.getElementById("id_localidad");
    const inputNombre = document.getElementById("nombre_centro_trabajo");
    const inputLocalidad = document.getElementById("localidad");
    const inputPoblacion = document.getElementById("poblacion");
    const inputEstado = document.getElementById("estado");

    const btnBuscar = document.getElementById("btnBuscar");
    const btnLimpiar = document.getElementById("btnLimpiar");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnCancelar = document.getElementById("btnCancelar");

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

    const mostrarAlerta = (titulo, texto, icono = "info") => {
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            confirmButtonText: "Aceptar"
        });
    };

    const limpiarCampos = () => {
        inputId.value = "";
        inputNombre.value = "";
        inputLocalidad.value = "";
        inputPoblacion.value = "";
        inputEstado.value = "";

        seccionInfoLocalidad.style.display = "none";
        Object.values(infoCampos).forEach(campo => campo.textContent = "-");
        idLocalidadSeleccionada = null;
        btnEliminar.disabled = true;
    };

    const mostrarInfoLocalidad = (datos) => {
        idLocalidadSeleccionada = datos.id_localidad;
        infoCampos.id.textContent = datos.id_localidad;
        infoCampos.nombre.textContent = datos.nombre_centro || "-";
        infoCampos.ubicacion.textContent = datos.ubicacion || "-";
        infoCampos.poblacion.textContent = datos.poblacion || "-";
        infoCampos.localidad.textContent = datos.localidad || "-";
        infoCampos.estado.textContent = datos.estado || "-";
        infoCampos.tipo.textContent = datos.tipo_instalacion || "-";

        seccionInfoLocalidad.style.display = "block";
        btnEliminar.disabled = false;
    };

    // --------------------- EVENTOS ---------------------

    btnBuscar.addEventListener("click", () => {
        const formData = new FormData();
        formData.append("id_localidad", inputId.value);
        formData.append("nombre_centro_trabajo", inputNombre.value);
        formData.append("localidad", inputLocalidad.value);
        formData.append("poblacion", inputPoblacion.value);
        formData.append("estado", inputEstado.value);

        fetch("/backend/buscarLocalidadesEliminar.php", {
            method: "POST",
            body: formData
        })
        .then(respuesta => respuesta.json())
        .then(data => {
            if (!data || (Array.isArray(data) && data.length === 0) || data.error) {
                mostrarAlerta("Sin resultados", data?.error || "No se encontraron localidades", "warning");
                seccionInfoLocalidad.style.display = "none";
                return;
            }

            // Si es array, tomar el primer elemento
            const localidad = Array.isArray(data) ? data[0] : data;
            mostrarInfoLocalidad(localidad);
        })
        .catch(error => {
            console.error(error);
            mostrarAlerta("Error", "Ocurrió un error al buscar localidades", "error");
        });
    });

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

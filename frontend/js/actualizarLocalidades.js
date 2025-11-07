// ---------------------------
// SCRIPT: Actualización de Localidades
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------
    // BLOQUE 0: VARIABLES GLOBALES
    // ---------------------------
    const inputBuscarNombre = document.getElementById("buscar_nombre_localidad");
    const botonBuscar = document.getElementById("btnBuscar");
    const botonActualizar = document.getElementById("btnActualizar");
    const botonLimpiar = document.getElementById("btnLimpiar");
    const botonCancelar = document.getElementById("btnCancelar");

    const seccionFormulario = document.getElementById("seccion-formulario");
    const formulario = document.getElementById("formActualizarLocalidad");

    const mensajeBusqueda = document.getElementById("mensaje-busqueda");
    const mensajeActualizacion = document.getElementById("mensaje-actualizacion");

    // Campos del formulario
    const campoId = document.getElementById("id_localidad");
    

    const campoNombreCentro = document.getElementById("nombre_centro_trabajo");
    const campoUbicacion = document.getElementById("ubicacion_georeferenciada");
    const campoPoblacion = document.getElementById("poblacion");
    const campoLocalidad = document.getElementById("localidad");
    const campoEstado = document.getElementById("estado");
    const campoTipoInstalacion = document.getElementById("tipo_instalacion");

    // ---------------------------
    // BLOQUE 1: FUNCIONES AUXILIARES
    // ---------------------------

    /**
     * Habilitar los campos del formulario para edición
     */
    function habilitarCampos() {
        campoNombreCentro.disabled = false;
        campoUbicacion.disabled = false;
        campoPoblacion.disabled = false;
        campoLocalidad.disabled = false;
        campoEstado.disabled = false;
        campoTipoInstalacion.disabled = false;

        botonActualizar.disabled = false;
        botonLimpiar.disabled = false;
    }

    /**
     * Deshabilitar los campos del formulario
     */
    function deshabilitarCampos() {
        campoNombreCentro.disabled = true;
        campoUbicacion.disabled = true;
        campoPoblacion.disabled = true;
        campoLocalidad.disabled = true;
        campoEstado.disabled = true;
        campoTipoInstalacion.disabled = true;

        botonActualizar.disabled = true;
        botonLimpiar.disabled = true;
    }

    /**
     * Limpiar formulario y mensajes
     */
    function limpiarFormulario() {
        formulario.reset();
        deshabilitarCampos();
        mensajeActualizacion.innerHTML = "";
        mensajeBusqueda.innerHTML = "";
        seccionFormulario.style.display = "none";
    }

    /**
     * Mostrar mensaje temporal
     * @param {HTMLElement} contenedor
     * @param {string} mensaje
     * @param {string} tipo - 'success', 'error', 'info'
     */
    function mostrarMensaje(contenedor, mensaje, tipo = "info") {
        Swal.fire({
            icon: tipo,
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }

    /**
     * Validar patrón de un campo
     * @param {HTMLInputElement | HTMLSelectElement} campo
     * @returns {boolean}
     */
    function validarCampo(campo) {
        if (!campo.checkValidity()) {
            campo.classList.add("input-error");
            return false;
        } else {
            campo.classList.remove("input-error");
            return true;
        }
    }

    /**
     * Validar todo el formulario antes de actualizar
     * @returns {boolean}
     */
    function validarFormulario() {
        let valido = true;
        const campos = [campoNombreCentro, campoUbicacion, campoPoblacion, campoLocalidad, campoEstado, campoTipoInstalacion];
        campos.forEach(campo => {
            if (!validarCampo(campo)) valido = false;
        });
        return valido;
    }

    /**
     * Llenar formulario con datos de localidad
     * @param {Object} datos
     */
    function llenarFormulario(datos) {
        campoId.value = datos.id_localidad || "";
        campoNombreCentro.value = datos.nombre_centro_trabajo || "";
        campoUbicacion.value = datos.ubicacion_georeferenciada || "";
        campoPoblacion.value = datos.poblacion || "";
        campoLocalidad.value = datos.localidad || "";
        campoEstado.value = datos.estado || "";
        campoTipoInstalacion.value = datos.tipo_instalacion || "";
        seccionFormulario.style.display = "block";
        habilitarCampos();
    }

    // ---------------------------
    // BLOQUE 2: BÚSQUEDA DE LOCALIDAD
    // ---------------------------

    botonBuscar.addEventListener("click", () => {
        const nombreBuscar = inputBuscarNombre.value.trim();

        if (nombreBuscar === "") {
            mostrarMensaje(mensajeBusqueda, "Ingrese un nombre para buscar", "info");
            return;
        }

        const formData = new FormData();
        formData.append("buscar_nombre_localidad", nombreBuscar);

        fetch("/backend/buscarLocalidad.php", {

            method: "POST",
            body: formData

        })

            .then(res => res.json())
            .then(datos => {
                console.log("Respuesta del PHP:", datos); // <- VERIFICAR AQUÍ
                if (datos && datos.id_localidad) {
                    llenarFormulario(datos);
                } else {
                    mostrarMensaje(mensajeBusqueda, "No se encontró la localidad", "error");
                    limpiarFormulario();
                }
            })
            .catch(err => {
                console.error("Error al buscar localidad:", err);
                mostrarMensaje(mensajeBusqueda, "Error en la búsqueda", "error");
            });
    });


    // ---------------------------
    // BLOQUE 3: ACTUALIZACIÓN DE LOCALIDAD
    // ---------------------------

    botonActualizar.addEventListener("click", () => {
        if (!validarFormulario()) {
            mostrarMensaje(mensajeActualizacion, "Corrija los campos inválidos", "error");
            return;
        }

        const datosActualizar = {
            id_localidad: campoId.value,
            nombre_centro_trabajo: campoNombreCentro.value.trim(),
            ubicacion_georeferenciada: campoUbicacion.value.trim(),
            poblacion: campoPoblacion.value.trim(),
            localidad: campoLocalidad.value.trim(),
            estado: campoEstado.value,
            tipo_instalacion: campoTipoInstalacion.value
        };
        console.log("ID que voy a enviar:", campoId.value);

        const formData = new FormData();
        for (const key in datosActualizar) {
            formData.append(key, datosActualizar[key]);
        }
        Swal.fire({
            title: '¿Desea actualizar esta localidad?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, actualizar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("/backend/actualizarLocalidad.php", {
                    method: "POST",
                    body: formData
                })
                    .then(res => res.json())
                    .then(respuesta => {
                        if (respuesta.exito) {
                            mostrarMensaje(mensajeActualizacion, "Localidad actualizada correctamente", "success");
                            limpiarFormulario();
                        } else {
                            mostrarMensaje(mensajeActualizacion, respuesta.mensaje || "Error al actualizar", "error");
                        }
                    })
                    .catch(err => {
                        console.error("Error al actualizar localidad:", err);
                        mostrarMensaje(mensajeActualizacion, "Error al actualizar localidad", "error");
                    });
            }
        });
    });

    // ---------------------------
    // BLOQUE 4: LIMPIAR Y CANCELAR
    // ---------------------------

    botonLimpiar.addEventListener("click", () => {
        limpiarFormulario();
    });

    botonCancelar.addEventListener("click", () => {
        window.location.href = "panel_general.html";
    });

    // Inicialmente deshabilitar campos
    deshabilitarCampos();

});

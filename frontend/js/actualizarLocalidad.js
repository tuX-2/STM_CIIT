document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------
    // VARIABLES GLOBALES
    // ---------------------------
    const inputBuscarNombre = document.getElementById('buscar_nombre_localidad');
    const botonBuscar = document.getElementById('btnBuscar');
    const botonActualizar = document.getElementById('btnActualizar');
    const botonLimpiar = document.getElementById('btnLimpiar');
    const botonCancelar = document.getElementById('btnCancelar');

    const seccionFormulario = document.getElementById('seccion-formulario');
    const formulario = document.getElementById('formActualizarLocalidad');

    const mensajeBusqueda = document.getElementById('mensaje-busqueda');
    const mensajeActualizacion = document.getElementById('mensaje-actualizacion');

    // Campos del formulario
    const campoId = document.getElementById('id_localidad');
    const campoNombreCentro = document.getElementById('nombre_centro_trabajo');
    const campoUbicacion = document.getElementById('ubicacion_georeferenciada');
    const campoPoblacion = document.getElementById('poblacion');
    const campoLocalidad = document.getElementById('localidad');
    const campoEstado = document.getElementById('estado');
    const campoTipoInstalacion = document.getElementById('tipo_instalacion');

    // ---------------------------
    // FUNCIONES AUXILIARES
    // ---------------------------
    function mostrarMensaje(contenedor, mensaje, tipo = 'info') {
        Swal.fire({
            icon: tipo,
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }

    function habilitarCampos() {
        [campoNombreCentro, campoUbicacion, campoPoblacion, campoLocalidad, campoEstado, campoTipoInstalacion].forEach(c => c.disabled = false);
        botonActualizar.disabled = false;
        botonLimpiar.disabled = false;
    }

    function deshabilitarCampos() {
        [campoNombreCentro, campoUbicacion, campoPoblacion, campoLocalidad, campoEstado, campoTipoInstalacion].forEach(c => c.disabled = true);
        botonActualizar.disabled = true;
        botonLimpiar.disabled = true;
    }

    function limpiarFormulario() {
        formulario.reset();

        // Quitar clases de error
        formulario.querySelectorAll('.campo-invalido, .input-error').forEach(e => e.classList.remove('campo-invalido', 'input-error'));

        // Limpiar mensajes de error
        formulario.querySelectorAll('.error-message').forEach(e => e.textContent = '');

        // Ocultar formulario y botones
        seccionFormulario.style.display = "none";
        deshabilitarCampos();

        // Limpiar mensajes generales
        mensajeBusqueda.textContent = '';
        mensajeActualizacion.textContent = '';
    }


    function validarCampo(campo) {
        const errorSpan = document.getElementById(`error_${campo.name}`);
        if (!campo.checkValidity()) {
            campo.classList.add('campo-invalido');
            if (errorSpan) {
                if (campo.validity.valueMissing) errorSpan.textContent = 'Campo obligatorio';
                else if (campo.validity.patternMismatch) errorSpan.textContent = campo.title || 'Formato inválido';
                else errorSpan.textContent = 'Campo inválido';
            }
            return false;
        } else {
            campo.classList.remove('campo-invalido');
            if (errorSpan) errorSpan.textContent = '';
            return true;
        }
    }

    function validarFormulario() {
        return [campoNombreCentro, campoUbicacion, campoPoblacion, campoLocalidad, campoEstado, campoTipoInstalacion]
            .map(validarCampo)
            .every(Boolean);
    }

    function llenarFormulario(datos) {
        campoId.value = datos.id_localidad || '';
        campoNombreCentro.value = datos.nombre_centro_trabajo || '';
        campoUbicacion.value = datos.ubicacion_georeferenciada || '';
        campoPoblacion.value = datos.poblacion || '';
        campoLocalidad.value = datos.localidad || '';
        campoEstado.value = datos.estado || '';
        campoTipoInstalacion.value = datos.tipo_instalacion || '';
        seccionFormulario.style.display = 'block';
        habilitarCampos();
    }

    // ---------------------------
    // BÚSQUEDA DE LOCALIDAD
    // ---------------------------
    botonBuscar.addEventListener('click', () => {
        const nombreBuscar = inputBuscarNombre.value.trim();
        if (!nombreBuscar) {
            mostrarMensaje(mensajeBusqueda, 'Ingrese un nombre para buscar', 'info');
            return;
        }

        const formData = new FormData();
        formData.append('buscar_nombre_localidad', nombreBuscar);

        fetch('/backend/buscarLocalidad.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(datos => {
                if (datos && datos.id_localidad) {
                    llenarFormulario(datos);
                    mensajeBusqueda.textContent = '';
                } else {
                    mostrarMensaje(mensajeBusqueda, 'No se encontró la localidad', 'error');
                    limpiarFormulario();
                }
            })
            .catch(err => {
                console.error(err);
                mostrarMensaje(mensajeBusqueda, 'Error en la búsqueda', 'error');
            });
    });

    // ---------------------------
    // ACTUALIZACIÓN DE LOCALIDAD
    // ---------------------------
    botonActualizar.addEventListener('click', (e) => {
        // Si el formulario no es válido, muestra el mensaje nativo del navegador
        if (!formulario.checkValidity()) {
            formulario.reportValidity(); // 🔸 muestra el “tooltip” naranjita del navegador
            return;
        }

        // Si es válido, continúa normalmente
        const datosActualizar = {
            id_localidad: campoId.value,
            nombre_centro_trabajo: campoNombreCentro.value.trim(),
            ubicacion_georeferenciada: campoUbicacion.value.trim(),
            poblacion: campoPoblacion.value.trim(),
            localidad: campoLocalidad.value.trim(),
            estado: campoEstado.value,
            tipo_instalacion: campoTipoInstalacion.value
        };

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
        }).then(result => {
            if (result.isConfirmed) {
                fetch('/backend/actualizarLocalidad.php', {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(respuesta => {
                        if (respuesta.exito || respuesta.success) {
                            mostrarMensaje(mensajeActualizacion, 'Localidad actualizada correctamente', 'success');
                            limpiarFormulario();
                        } else {
                            mostrarMensaje(mensajeActualizacion, respuesta.mensaje || respuesta.error || 'Error al actualizar', 'error');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        mostrarMensaje(mensajeActualizacion, 'Error al actualizar localidad', 'error');
                    });
            }
        });
    });


    // ---------------------------
    // LIMPIAR Y CANCELAR
    // ---------------------------
    botonLimpiar.addEventListener('click', limpiarFormulario);

    botonCancelar.addEventListener('click', () => {
        Swal.fire({
            title: '¿Desea cancelar y volver al panel?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, volver',
            cancelButtonText: 'No'
        }).then(result => {
            if (result.isConfirmed) window.location.href = './panel_general.html';
        });
    });

    // ---------------------------
    // VALIDACIÓN EN TIEMPO REAL
    // ---------------------------
    formulario.querySelectorAll('input[required], select[required]').forEach(campo => {
        campo.addEventListener('input', () => validarCampo(campo));
    });

    // Inicialmente deshabilitar campos
    deshabilitarCampos();
});

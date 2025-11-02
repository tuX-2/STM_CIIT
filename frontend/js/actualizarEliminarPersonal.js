document.addEventListener('DOMContentLoaded', function() {
    // Detectar en qué página estamos
    const esActualizar = document.getElementById('updateForm') !== null;
    const esEliminar = document.getElementById('btnEliminar') !== null;
    
    if (esActualizar) {
        inicializarActualizar();
    } else if (esEliminar) {
        inicializarEliminar();
    }
});

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================
function validarCURP(curp) {
    // Eliminar espacios
    curp = curp.trim();
    
    // Validar longitud
    if (curp.length === 0) {
        return { valido: false, mensaje: 'Por favor ingrese una CURP' };
    }
    
    if (curp.length !== 18) {
        return { valido: false, mensaje: 'La CURP debe tener exactamente 18 caracteres.\nActualmente tiene ' + curp.length + ' caracteres.' };
    }
    
    // Validar que solo contenga letras y números
    const regexCURP = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    if (!regexCURP.test(curp)) {
        return { valido: false, mensaje: 'La CURP tiene un formato inválido.\nDebe contener solo letras mayúsculas y números en el formato correcto.' };
    }
    
    return { valido: true, mensaje: '' };
}

function mostrarError(mensaje) {
    alert('⚠️ Error de validación\n\n' + mensaje);
}

function mostrarExito(mensaje) {
    alert('✓ Operación exitosa\n\n' + mensaje);
}

function mostrarConfirmacion(titulo, mensaje) {
    return confirm('⚠️ ' + titulo + '\n\n' + mensaje);
}

// ============================================
// FUNCIONES PARA ACTUALIZAR PERSONAL
// ============================================
function inicializarActualizar() {
    const curpBusquedaInput = document.getElementById('curp_busqueda');
    const curpInput = document.getElementById('curp');
    const idPersonalInput = document.getElementById('id_personal');
    const formulario = document.getElementById('updateForm');
    const afiliacionSelect = document.getElementById('afiliacion_laboral');
    
    // Cargar localidades al iniciar
    cargarLocalidades(afiliacionSelect);
    
    // Evento cuando se presiona Enter o Tab en el campo CURP de búsqueda
    curpBusquedaInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            buscarPersonalActualizar(curpBusquedaInput, idPersonalInput, curpInput);
        }
    });
    
    // curpBusquedaInput.addEventListener('blur', function() {
    //     if (this.value.trim() !== '') {
    //         buscarPersonalActualizar(curpBusquedaInput, idPersonalInput, curpInput);
    //     }
    // });
    
    // Manejar el envío del formulario
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        actualizarPersonal(formulario, idPersonalInput, curpInput, curpBusquedaInput);
    });
    
    // Manejar botón de limpiar
    formulario.addEventListener('reset', function() {
        limpiarFormularioActualizar(idPersonalInput, curpInput);
        curpBusquedaInput.value = '';
    });
    
    // Inicializar formulario deshabilitado
    habilitarCamposActualizar(false);
    
    // Convertir CURPs a mayúsculas y validar en tiempo real
    curpBusquedaInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (this.value.length > 18) {
            this.value = this.value.substring(0, 18);
        }
    });
    
    curpInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (this.value.length > 18) {
            this.value = this.value.substring(0, 18);
        }
    });
}

function buscarPersonalActualizar(curpBusquedaInput, idPersonalInput, curpInput) {
    const curpBusqueda = curpBusquedaInput.value.trim().toUpperCase();
    
    // Validar CURP
    const validacion = validarCURP(curpBusqueda);
    if (!validacion.valido) {
        mostrarError(validacion.mensaje);
        return;
    }
    
    curpBusquedaInput.disabled = true;
    
    fetch(`../backend/actualizarEliminarPersonal.php?accion=obtenerPersonal&curp=${encodeURIComponent(curpBusqueda)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                llenarFormularioActualizar(data.data, idPersonalInput, curpInput);
                mostrarExito('Personal encontrado.\nAhora puede editar los datos.');
            } else {
                mostrarError(data.message || 'No se encontró ningún personal con la CURP proporcionada.\n\nVerifique que la CURP sea correcta.');
                limpiarFormularioActualizar(idPersonalInput, curpInput);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarError('No se pudo conectar con el servidor.\nPor favor, intente nuevamente.');
        })
        .finally(() => {
            curpBusquedaInput.disabled = false;
        });
}

function llenarFormularioActualizar(datos, idPersonalInput, curpInput) {
    idPersonalInput.value = datos.id_personal || '';
    curpInput.value = datos.curp || '';
    document.getElementById('nombre_personal').value = datos.nombre_personal || '';
    document.getElementById('apellido_paterno').value = datos.apellido_paterno || '';
    document.getElementById('apellido_materno').value = datos.apellido_materno || '';
    document.getElementById('afiliacion_laboral').value = datos.afiliacion_laboral || '';
    document.getElementById('cargo').value = datos.cargo || '';
    
    habilitarCamposActualizar(true);
}

function limpiarFormularioActualizar(idPersonalInput, curpInput) {
    idPersonalInput.value = '';
    curpInput.value = '';
    document.getElementById('nombre_personal').value = '';
    document.getElementById('apellido_paterno').value = '';
    document.getElementById('apellido_materno').value = '';
    document.getElementById('afiliacion_laboral').value = '';
    document.getElementById('cargo').value = '';
    
    habilitarCamposActualizar(false);
}

function habilitarCamposActualizar(habilitar) {
    const campos = ['curp', 'nombre_personal', 'apellido_paterno', 'apellido_materno', 
                   'afiliacion_laboral', 'cargo'];
    
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.disabled = !habilitar;
        }
    });
}

function actualizarPersonal(formulario, idPersonalInput, curpInput, curpBusquedaInput) {
    // Validar que haya un personal cargado
    if (!idPersonalInput.value) {
        mostrarError('Debe buscar un personal válido antes de actualizar.\n\nIngrese una CURP en el campo de búsqueda.');
        return;
    }
    
    // Validar la nueva CURP
    const validacion = validarCURP(curpInput.value);
    if (!validacion.valido) {
        mostrarError(validacion.mensaje);
        return;
    }
    
    // Confirmar actualización
    const nombreCompleto = document.getElementById('nombre_personal').value + ' ' + 
                          document.getElementById('apellido_paterno').value + ' ' + 
                          (document.getElementById('apellido_materno').value || '');
    
    if (!mostrarConfirmacion('Confirmar actualización', 
        'Se actualizarán los datos de:\n' + nombreCompleto.trim() + 
        '\n\n¿Desea continuar?')) {
        return;
    }
    
    const formData = new FormData(formulario);
    formData.append('accion', 'actualizarPersonal');
    
    fetch('../backend/actualizarEliminarPersonal.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito('Los datos del personal se han actualizado correctamente.');
            curpBusquedaInput.value = curpInput.value;
        } else {
            mostrarError('No se pudo actualizar el registro.\n\n' + (data.message || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('No se pudo conectar con el servidor.\nPor favor, intente nuevamente.');
    });
}

// ============================================
// FUNCIONES PARA ELIMINAR PERSONAL
// ============================================
function inicializarEliminar() {
    const curpBusquedaInput = document.getElementById('curp_busqueda');
    const infoSection = document.getElementById('info-section');
    const idPersonalInput = document.getElementById('id_personal');
    const btnEliminar = document.getElementById('btnEliminar');
    
    let personalActual = null;
    
    // Evento cuando se presiona Enter o Tab en el campo CURP
    curpBusquedaInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            buscarPersonalEliminar();
        }
    });
    
    //curpBusquedaInput.addEventListener('blur', function() {
    //    if (this.value.trim() !== '') {
    //        buscarPersonalEliminar();
    //    }
    //});
    
    // Convertir a mayúsculas y validar en tiempo real
    curpBusquedaInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (this.value.length > 18) {
            this.value = this.value.substring(0, 18);
        }
    });
    
    function buscarPersonalEliminar() {
        const curp = curpBusquedaInput.value.trim().toUpperCase();
        
        // Validar CURP
        const validacion = validarCURP(curp);
        if (!validacion.valido) {
            mostrarError(validacion.mensaje);
            return;
        }
        
        curpBusquedaInput.disabled = true;
        btnEliminar.disabled = true;
        
        fetch(`../backend/actualizarEliminarPersonal.php?accion=obtenerPersonal&curp=${encodeURIComponent(curp)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    personalActual = data.data;
                    mostrarInformacionEliminar(data.data, idPersonalInput, infoSection, btnEliminar);
                } else {
                    mostrarError(data.message || 'No se encontró ningún personal con la CURP proporcionada.\n\nVerifique que la CURP sea correcta.');
                    ocultarInformacionEliminar(infoSection, idPersonalInput, btnEliminar);
                    personalActual = null;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarError('No se pudo conectar con el servidor.\nPor favor, intente nuevamente.');
                ocultarInformacionEliminar(infoSection, idPersonalInput, btnEliminar);
                personalActual = null;
            })
            .finally(() => {
                curpBusquedaInput.disabled = false;
            });
    }
    
    btnEliminar.addEventListener('click', function() {
        eliminarPersonal(personalActual, idPersonalInput, btnEliminar, curpBusquedaInput, infoSection);
    });
    
    ocultarInformacionEliminar(infoSection, idPersonalInput, btnEliminar);
}

function mostrarInformacionEliminar(datos, idPersonalInput, infoSection, btnEliminar) {
    idPersonalInput.value = datos.id_personal || '';
    
    document.getElementById('display_curp').textContent = datos.curp || '-';
    document.getElementById('display_nombre').textContent = datos.nombre_personal || '-';
    document.getElementById('display_paterno').textContent = datos.apellido_paterno || '-';
    document.getElementById('display_materno').textContent = datos.apellido_materno || '-';
    document.getElementById('display_cargo').textContent = datos.cargo || '-';
    
    obtenerNombreLocalidad(datos.afiliacion_laboral);
    
    infoSection.classList.remove('hidden');
    btnEliminar.disabled = false;
}

function ocultarInformacionEliminar(infoSection, idPersonalInput, btnEliminar) {
    infoSection.classList.add('hidden');
    idPersonalInput.value = '';
    btnEliminar.disabled = true;
}

function eliminarPersonal(personalActual, idPersonalInput, btnEliminar, curpBusquedaInput, infoSection) {
    if (!personalActual || !idPersonalInput.value) {
        mostrarError('No hay un registro seleccionado para eliminar.\n\nPrimero busque un personal por su CURP.');
        return;
    }
    
    const nombreCompleto = `${personalActual.nombre_personal} ${personalActual.apellido_paterno} ${personalActual.apellido_materno || ''}`.trim();
    
    const mensaje = '⚠️ ADVERTENCIA: Esta acción es PERMANENTE\n\n' +
                   'Se eliminará el siguiente registro:\n\n' +
                   '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
                   'Nombre: ' + nombreCompleto + '\n' +
                   'CURP: ' + personalActual.curp + '\n' +
                   'Cargo: ' + personalActual.cargo + '\n' +
                   '━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                   '⚠️ Esta acción NO se puede deshacer.\n\n' +
                   '¿Está completamente seguro de eliminar este registro?';
    
    if (!confirm(mensaje)) {
        return;
    }
    
    btnEliminar.disabled = true;
    btnEliminar.textContent = 'Eliminando...';
    
    const formData = new FormData();
    formData.append('accion', 'eliminarPersonal');
    formData.append('id_personal', idPersonalInput.value);
    
    fetch('../backend/actualizarEliminarPersonal.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarExito('El registro se ha eliminado correctamente.\n\n' + 
                        (data.data && data.data.usuarios_eliminados > 0 
                         ? 'También se eliminaron ' + data.data.usuarios_eliminados + ' usuario(s) asociado(s).' 
                         : ''));
            curpBusquedaInput.value = '';
            ocultarInformacionEliminar(infoSection, idPersonalInput, btnEliminar);
        } else {
            mostrarError('No se pudo eliminar el registro.\n\n' + (data.message || 'Error desconocido'));
            btnEliminar.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError('No se pudo conectar con el servidor.\nPor favor, intente nuevamente.');
        btnEliminar.disabled = false;
    })
    .finally(() => {
        btnEliminar.textContent = 'Eliminar Registro';
    });
}

// ============================================
// FUNCIONES COMPARTIDAS
// ============================================
function cargarLocalidades(afiliacionSelect) {
    fetch('../backend/actualizarEliminarPersonal.php?accion=obtenerLocalidades')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                afiliacionSelect.innerHTML = '<option value="">Seleccione una opción</option>';
                
                data.data.forEach(localidad => {
                    const option = document.createElement('option');
                    option.value = localidad.id_localidad;
                    option.textContent = localidad.nombre_centro_trabajo;
                    afiliacionSelect.appendChild(option);
                });
            } else {
                console.error('Error al cargar localidades:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            mostrarError('No se pudieron cargar las localidades.\nPor favor, recargue la página.');
        });
}

function obtenerNombreLocalidad(idLocalidad) {
    if (!idLocalidad) {
        document.getElementById('display_afiliacion').textContent = '-';
        return;
    }
    
    fetch('../backend/actualizarEliminarPersonal.php?accion=obtenerLocalidades')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const localidad = data.data.find(loc => loc.id_localidad == idLocalidad);
                document.getElementById('display_afiliacion').textContent = 
                    localidad ? localidad.nombre_centro_trabajo : '-';
            }
        })
        .catch(error => {
            console.error('Error al obtener localidad:', error);
            document.getElementById('display_afiliacion').textContent = 'ID: ' + idLocalidad;
        });
}
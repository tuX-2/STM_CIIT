// ===============================
// CONFIGURACIÓN DE RUTAS
// ===============================
const API_URL = '../backend/actualizarLocalidades.php';

// ===============================
// VARIABLES GLOBALES
// ===============================
let localidadActual = null;
let cambiosRealizados = false;
let accionPendiente = null;

// ===============================
// ELEMENTOS DEL DOM
// ===============================
const searchForm = document.getElementById('searchForm');
const updateForm = document.getElementById('updateForm');
const editSection = document.getElementById('editSection');
const confirmModal = document.getElementById('confirmModal');
const alertContainer = document.getElementById('alertContainer');

// Botones
const btnActualizar = document.getElementById('btnActualizar');
const btnLimpiar = document.getElementById('btnLimpiar');
const btnCancelar = document.getElementById('btnCancelar');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelarModal = document.getElementById('btnCancelarModal');

// Campos de búsqueda
const searchId = document.getElementById('searchId');
const searchNombre = document.getElementById('searchNombre');
const searchLocalidad = document.getElementById('searchLocalidad');
const searchPoblacion = document.getElementById('searchPoblacion');
const searchEstado = document.getElementById('searchEstado');

// Campos de edición
const idLocalidad = document.getElementById('idLocalidad');
const nombreCentro = document.getElementById('nombreCentro');
const ubicacionGeo = document.getElementById('ubicacionGeo');
const poblacion = document.getElementById('poblacion');
const localidad = document.getElementById('localidad');
const estado = document.getElementById('estado');
const tipoInstalacion = document.getElementById('tipoInstalacion');

// ===============================
// FUNCIONES DE ALERTAS
// ===============================
function mostrarAlerta(mensaje, tipo = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${tipo} show`;
    alert.textContent = mensaje;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// ===============================
// FUNCIONES DE MODAL
// ===============================
function mostrarModal(mensaje, advertencia = false, accion = null) {
    document.getElementById('modalMessage').textContent = mensaje;
    const modalWarning = document.getElementById('modalWarning');
    
    if (advertencia) {
        modalWarning.style.display = 'block';
    } else {
        modalWarning.style.display = 'none';
    }
    
    accionPendiente = accion;
    confirmModal.classList.add('active');
}

function cerrarModal() {
    confirmModal.classList.remove('active');
    accionPendiente = null;
}

// ===============================
// FUNCIONES DE VALIDACIÓN
// ===============================
function validarCampoTexto(valor, minLength = 3, maxLength = 100) {
    if (!valor || valor.trim().length === 0) {
        return { valido: false, mensaje: 'Este campo no puede estar vacío' };
    }
    
    const valorTrim = valor.trim();
    
    if (valorTrim.length < minLength) {
        return { valido: false, mensaje: `Debe tener al menos ${minLength} caracteres` };
    }
    
    if (valorTrim.length > maxLength) {
        return { valido: false, mensaje: `No puede exceder los ${maxLength} caracteres` };
    }
    
    // Solo letras, números, espacios y caracteres especiales básicos
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-]+$/;
    if (!regex.test(valorTrim)) {
        return { valido: false, mensaje: 'Contiene caracteres no válidos' };
    }
    
    return { valido: true };
}

function validarCamposObligatorios() {
    let errores = [];
    
    // Validar Nombre Centro de Trabajo
    const validNombre = validarCampoTexto(nombreCentro.value, 3, 100);
    if (!validNombre.valido) {
        errores.push({ campo: nombreCentro, mensaje: `Nombre: ${validNombre.mensaje}` });
    }
    
    // Validar Población
    const validPoblacion = validarCampoTexto(poblacion.value, 3, 100);
    if (!validPoblacion.valido) {
        errores.push({ campo: poblacion, mensaje: `Población: ${validPoblacion.mensaje}` });
    }
    
    // Validar Localidad
    const validLocalidad = validarCampoTexto(localidad.value, 3, 100);
    if (!validLocalidad.valido) {
        errores.push({ campo: localidad, mensaje: `Localidad: ${validLocalidad.mensaje}` });
    }
    
    // Validar Estado
    const validEstado = validarCampoTexto(estado.value, 3, 100);
    if (!validEstado.valido) {
        errores.push({ campo: estado, mensaje: `Estado: ${validEstado.mensaje}` });
    }
    
    // Validar Tipo de Instalación
    if (!tipoInstalacion.value || tipoInstalacion.value === '') {
        errores.push({ campo: tipoInstalacion, mensaje: 'Debe seleccionar un tipo de instalación' });
    }
    
    return errores;
}

function marcarError(campo) {
    campo.classList.add('error');
}

function limpiarError(campo) {
    campo.classList.remove('error');
}

function limpiarTodosLosErrores() {
    [nombreCentro, ubicacionGeo, poblacion, localidad, estado, tipoInstalacion].forEach(campo => {
        limpiarError(campo);
    });
}

// ===============================
// FUNCIONES DE BÚSQUEDA
// ===============================
async function buscarLocalidad(parametros) {
    try {
        const queryString = new URLSearchParams(parametros).toString();
        const response = await fetch(`${API_URL}?accion=buscar&${queryString}`);
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function llenarFormulario(data) {
    idLocalidad.value = data.id_localidad;
    nombreCentro.value = data.nombre_centro_trabajo || '';
    ubicacionGeo.value = data.ubicacion_georeferenciada || '';
    poblacion.value = data.poblacion || '';
    localidad.value = data.localidad || '';
    estado.value = data.estado || '';
    tipoInstalacion.value = data.tipo_instalacion || '';
    
    localidadActual = { ...data };
    cambiosRealizados = false;
}

function habilitarCamposEdicion() {
    nombreCentro.disabled = false;
    ubicacionGeo.disabled = false;
    poblacion.disabled = false;
    localidad.disabled = false;
    estado.disabled = false;
    tipoInstalacion.disabled = false;
    
    btnActualizar.disabled = false;
    btnLimpiar.disabled = false;
}

function deshabilitarCamposEdicion() {
    nombreCentro.disabled = true;
    ubicacionGeo.disabled = true;
    poblacion.disabled = true;
    localidad.disabled = true;
    estado.disabled = true;
    tipoInstalacion.disabled = true;
    
    btnActualizar.disabled = true;
    btnLimpiar.disabled = true;
}

// ===============================
// FUNCIONES DE ACTUALIZACIÓN
// ===============================
async function actualizarLocalidad() {
    try {
        const datosActualizados = {
            id_localidad: idLocalidad.value,
            nombre_centro_trabajo: nombreCentro.value.trim(),
            ubicacion_georeferenciada: ubicacionGeo.value.trim(),
            poblacion: poblacion.value.trim(),
            localidad: localidad.value.trim(),
            estado: estado.value.trim(),
            tipo_instalacion: tipoInstalacion.value
        };
        
        const response = await fetch(`${API_URL}?accion=actualizar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ===============================
// MANEJADORES DE EVENTOS
// ===============================

// Búsqueda de localidad
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Construir parámetros de búsqueda
    const parametros = {};
    
    if (searchId.value) {
        parametros.id = searchId.value;
    }
    if (searchNombre.value && searchNombre.value.trim().length >= 3) {
        parametros.nombre = searchNombre.value.trim();
    }
    if (searchLocalidad.value && searchLocalidad.value.trim().length >= 3) {
        parametros.localidad = searchLocalidad.value.trim();
    }
    if (searchPoblacion.value && searchPoblacion.value.trim().length >= 3) {
        parametros.poblacion = searchPoblacion.value.trim();
    }
    if (searchEstado.value && searchEstado.value.trim().length >= 3) {
        parametros.estado = searchEstado.value.trim();
    }
    
    // Validar que hay al menos un parámetro
    if (Object.keys(parametros).length === 0) {
        mostrarAlerta('Ingrese un identificador válido para continuar.', 'error');
        return;
    }
    
    // Mostrar loading
    searchForm.classList.add('loading');
    
    try {
        const resultado = await buscarLocalidad(parametros);
        
        if (resultado.success && resultado.data) {
            llenarFormulario(resultado.data);
            habilitarCamposEdicion();
            editSection.classList.add('active');
            mostrarAlerta('Localidad encontrada. Puede realizar modificaciones.', 'success');
            
            // Scroll suave hacia el formulario
            editSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            mostrarAlerta(resultado.message || 'No se encontró ninguna localidad con los criterios ingresados.', 'error');
            editSection.classList.remove('active');
        }
        
    } catch (error) {
        mostrarAlerta('Error al consultar los datos. Intente nuevamente.', 'error');
        editSection.classList.remove('active');
    } finally {
        searchForm.classList.remove('loading');
    }
});

// Detectar cambios en los campos
[nombreCentro, ubicacionGeo, poblacion, localidad, estado, tipoInstalacion].forEach(campo => {
    campo.addEventListener('input', () => {
        cambiosRealizados = true;
        limpiarError(campo);
    });
});

// Actualizar localidad
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    limpiarTodosLosErrores();
    
    // Validar campos
    const errores = validarCamposObligatorios();
    
    if (errores.length > 0) {
        // Marcar campos con error
        errores.forEach(error => {
            marcarError(error.campo);
        });
        
        // Mostrar mensaje de error
        const mensajeErrores = errores.map(e => e.mensaje).join('. ');
        mostrarAlerta(`Se encontraron errores en el formulario: ${mensajeErrores}`, 'error');
        
        // Enfocar primer campo con error
        errores[0].campo.focus();
        return;
    }
    
    // Mostrar modal de confirmación
    mostrarModal('¿Desea guardar los cambios realizados en la localidad?', true, 'actualizar');
});

// Confirmar acción en modal
btnConfirmar.addEventListener('click', async () => {
    if (accionPendiente === 'actualizar') {
        cerrarModal();
        
        // Mostrar loading
        updateForm.classList.add('loading');
        
        try {
            const resultado = await actualizarLocalidad();
            
            if (resultado.success) {
                mostrarAlerta('Localidad actualizada correctamente.', 'success');
                deshabilitarCamposEdicion();
                cambiosRealizados = false;
                
                // Actualizar datos actuales
                localidadActual = {
                    id_localidad: idLocalidad.value,
                    nombre_centro_trabajo: nombreCentro.value,
                    ubicacion_georeferenciada: ubicacionGeo.value,
                    poblacion: poblacion.value,
                    localidad: localidad.value,
                    estado: estado.value,
                    tipo_instalacion: tipoInstalacion.value
                };
            } else {
                mostrarAlerta(resultado.message || 'Error al guardar los cambios. Intente nuevamente.', 'error');
            }
            
        } catch (error) {
            mostrarAlerta('Error al guardar los cambios. Intente nuevamente.', 'error');
        } finally {
            updateForm.classList.remove('loading');
        }
        
    } else if (accionPendiente === 'limpiar') {
        cerrarModal();
        limpiarFormulario();
        mostrarAlerta('Campos limpiados correctamente.', 'info');
        
    } else if (accionPendiente === 'cancelar') {
        cerrarModal();
        window.location.href = 'index.html'; // Ajustar según tu menú principal
    }
});

// Cancelar en modal
btnCancelarModal.addEventListener('click', () => {
    if (accionPendiente === 'actualizar') {
        mostrarAlerta('Cambios cancelados. No se realizaron modificaciones.', 'info');
    }
    cerrarModal();
});

// Botón Limpiar
btnLimpiar.addEventListener('click', () => {
    mostrarModal('¿Desea borrar los datos cargados y comenzar una nueva búsqueda?', false, 'limpiar');
});

// Botón Cancelar
btnCancelar.addEventListener('click', () => {
    if (cambiosRealizados) {
        mostrarModal('¿Está seguro de que desea salir? Se perderán los cambios realizados.', true, 'cancelar');
    } else {
        window.location.href = 'index.html'; // Ajustar según tu menú principal
    }
});

// Función limpiar formulario
function limpiarFormulario() {
    // Limpiar búsqueda
    searchId.value = '';
    searchNombre.value = '';
    searchLocalidad.value = '';
    searchPoblacion.value = '';
    searchEstado.value = '';
    
    // Limpiar edición
    idLocalidad.value = '';
    nombreCentro.value = '';
    ubicacionGeo.value = '';
    poblacion.value = '';
    localidad.value = '';
    estado.value = '';
    tipoInstalacion.value = '';
    
    // Ocultar sección de edición
    editSection.classList.remove('active');
    
    // Limpiar errores
    limpiarTodosLosErrores();
    
    // Resetear variables
    localidadActual = null;
    cambiosRealizados = false;
    
    // Desactivar botones
    deshabilitarCamposEdicion();
}

// Cerrar modal al hacer clic fuera
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        cerrarModal();
    }
});

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de Actualización de Localidades iniciado');
    console.log('API URL:', API_URL);
    deshabilitarCamposEdicion();
});
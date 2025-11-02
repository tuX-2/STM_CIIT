// Variables globales
let usuarioActual = null;
const URL_BASE = '../backend/pruebas/eliminarUsuario.php';

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

function inicializar() {
    console.log('Inicializando aplicación...');
    configurarEventos();
}

// Configurar eventos
function configurarEventos() {
    // Input CURP
    const curpInput = document.getElementById('curp_usuario');
    if (curpInput) {
        curpInput.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase();
        });
        
        curpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarUsuario();
            }
        });
    }
    
    // Botón Buscar
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarUsuario);
    }
    
    // Botón Eliminar
    const btnEliminar = document.getElementById('btnEliminar');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', confirmarEliminacion);
    }
    
    // Botón Cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelar);
    }
    
    // Botón Confirmar Eliminación
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', eliminarUsuario);
    }
    
    // Botón Cancelar Modal
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModal);
    }
    
    console.log('Eventos configurados correctamente');
}

// Validar formato de CURP
function validarCURP(curp) {
    if (curp.length !== 18) {
        return false;
    }
    const regexCURP = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    return regexCURP.test(curp);
}

// Buscar usuario por CURP
function buscarUsuario() {
    const curpInput = document.getElementById('curp_usuario');
    if (!curpInput) {
        console.error('No se encuentra el campo CURP');
        return;
    }
    
    const curp = curpInput.value.trim().toUpperCase();
    
    if (curp === '') {
        mostrarAlerta('error', 'Por favor ingrese una CURP');
        return;
    }
    
    if (!validarCURP(curp)) {
        mostrarAlerta('error', 'La CURP ingresada no tiene un formato válido (18 caracteres)');
        return;
    }
    
    mostrarCargando(true);
    
    const url = URL_BASE + '?accion=obtenerUsuario&curp=' + encodeURIComponent(curp);
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            mostrarCargando(false);
            
            if (data.success) {
                usuarioActual = data.data;
                mostrarInformacionUsuario(data.data);
                mostrarAlerta('info', 'Usuario encontrado. Revise la información antes de eliminar.');
            } else {
                ocultarInformacion();
                mostrarAlerta('error', data.message);
            }
        })
        .catch(error => {
            mostrarCargando(false);
            console.error('Error:', error);
            mostrarAlerta('error', 'Error de conexión al buscar el usuario');
        });
}

// Mostrar información del usuario
function mostrarInformacionUsuario(usuario) {
    const infoId = document.getElementById('info_id');
    const infoNombreUsuario = document.getElementById('info_nombre_usuario');
    const infoCorreo = document.getElementById('info_correo');
    const infoCurp = document.getElementById('info_curp');
    const infoPersonal = document.getElementById('info_personal');
    
    if (infoId) infoId.textContent = usuario.id_usuario;
    if (infoNombreUsuario) infoNombreUsuario.textContent = usuario.nombre_usuario;
    if (infoCorreo) infoCorreo.textContent = usuario.correo_electronico || 'Sin correo';
    if (infoCurp) infoCurp.textContent = usuario.curp || 'Sin CURP';
    
    if (infoPersonal) {
        if (usuario.nombre_personal) {
            const nombreCompleto = [
                usuario.nombre_personal,
                usuario.apellido_paterno,
                usuario.apellido_materno
            ].filter(Boolean).join(' ');
            infoPersonal.textContent = nombreCompleto;
        } else {
            infoPersonal.textContent = 'Sin personal asociado';
        }
    }
    
    const userInfoSection = document.getElementById('userInfoSection');
    if (userInfoSection) {
        userInfoSection.classList.add('active');
    }
}

// Confirmar eliminación
function confirmarEliminacion() {
    if (!usuarioActual) {
        mostrarAlerta('error', 'No hay usuario seleccionado');
        return;
    }
    
    const modalNombreUsuario = document.getElementById('modal_nombre_usuario');
    if (modalNombreUsuario) {
        modalNombreUsuario.textContent = usuarioActual.nombre_usuario;
    }
    
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.classList.add('active');
    }
}

// Cerrar modal
function cerrarModal() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) {
        confirmModal.classList.remove('active');
    }
}

// Eliminar usuario
function eliminarUsuario() {
    if (!usuarioActual) {
        mostrarAlerta('error', 'No hay usuario seleccionado');
        cerrarModal();
        return;
    }
    
    cerrarModal();
    mostrarCargando(true);
    
    const formData = new FormData();
    formData.append('accion', 'eliminarUsuario');
    formData.append('id_usuario', usuarioActual.id_usuario);
    
    fetch(URL_BASE, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        mostrarCargando(false);
        
        if (data.success) {
            mostrarAlerta('success', data.message);
            setTimeout(() => {
                limpiarTodo();
            }, 2000);
        } else {
            mostrarAlerta('error', data.message);
        }
    })
    .catch(error => {
        mostrarCargando(false);
        console.error('Error:', error);
        mostrarAlerta('error', 'Error de conexión al eliminar el usuario');
    });
}

// Cancelar
function cancelar() {
    if (confirm('¿Está seguro de cancelar?')) {
        limpiarTodo();
        mostrarAlerta('info', 'Operación cancelada');
    }
}

// Limpiar todo
function limpiarTodo() {
    const curpInput = document.getElementById('curp_usuario');
    if (curpInput) {
        curpInput.value = '';
        curpInput.focus();
    }
    ocultarInformacion();
    usuarioActual = null;
}

// Ocultar información
function ocultarInformacion() {
    const userInfoSection = document.getElementById('userInfoSection');
    if (userInfoSection) {
        userInfoSection.classList.remove('active');
    }
}

// Mostrar/ocultar indicador de carga
function mostrarCargando(estado) {
    const searchSection = document.querySelector('.search-section');
    const userInfoSection = document.getElementById('userInfoSection');
    
    if (searchSection) {
        if (estado) {
            searchSection.classList.add('loading');
        } else {
            searchSection.classList.remove('loading');
        }
    }
    
    if (userInfoSection) {
        if (estado) {
            userInfoSection.classList.add('loading');
        } else {
            userInfoSection.classList.remove('loading');
        }
    }
}

// Mostrar alerta
function mostrarAlerta(tipo, mensaje) {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;
    
    alertDiv.className = 'alert';
    
    if (tipo === 'success') {
        alertDiv.classList.add('alert-success');
    } else if (tipo === 'error') {
        alertDiv.classList.add('alert-error');
    } else if (tipo === 'info') {
        alertDiv.classList.add('alert-info');
    }
    
    alertDiv.textContent = mensaje;
    alertDiv.classList.add('show');
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 5000);
}
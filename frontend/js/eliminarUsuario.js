// Variables globales
let usuarioActual = null;
const URL_BASE = '../backend/pruebas/eliminarUsuario.php';

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    const idUsuarioInput = document.getElementById('id_usuario');
    
    // Buscar al presionar Enter
    idUsuarioInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarUsuario();
        }
    });
}

// Buscar usuario por ID
function buscarUsuario() {
    const idUsuario = document.getElementById('id_usuario').value.trim();
    
    if (idUsuario === '' || idUsuario < 1) {
        mostrarAlerta('error', 'Por favor ingrese un ID de usuario válido');
        return;
    }
    
    // Mostrar indicador de carga
    mostrarCargando(true);
    
    fetch(URL_BASE + '?accion=obtenerUsuario&id_usuario=' + encodeURIComponent(idUsuario))
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
    // Llenar información
    document.getElementById('info_id').textContent = usuario.id_usuario;
    document.getElementById('info_nombre_usuario').textContent = usuario.nombre_usuario;
    document.getElementById('info_correo').textContent = usuario.correo_electronico || 'Sin correo';
    
    // Mostrar nombre completo del personal asociado
    if (usuario.nombre_personal) {
        const nombreCompleto = [
            usuario.nombre_personal,
            usuario.apellido_paterno,
            usuario.apellido_materno
        ].filter(Boolean).join(' ');
        document.getElementById('info_personal').textContent = nombreCompleto;
    } else {
        document.getElementById('info_personal').textContent = 'Sin personal asociado';
    }
    
    // Mostrar sección de información
    document.getElementById('userInfoSection').classList.add('active');
}

// Confirmar eliminación (abre modal)
function confirmarEliminacion() {
    if (!usuarioActual) {
        mostrarAlerta('error', 'No hay usuario seleccionado');
        return;
    }
    
    // Llenar modal con nombre de usuario
    document.getElementById('modal_nombre_usuario').textContent = usuarioActual.nombre_usuario;
    
    // Mostrar modal
    document.getElementById('confirmModal').classList.add('active');
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// Eliminar usuario
function eliminarUsuario() {
    if (!usuarioActual) {
        mostrarAlerta('error', 'No hay usuario seleccionado');
        cerrarModal();
        return;
    }
    
    // Cerrar modal
    cerrarModal();
    
    // Mostrar indicador de carga
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
            // Limpiar y resetear
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
    document.getElementById('id_usuario').value = '';
    ocultarInformacion();
    usuarioActual = null;
    document.getElementById('id_usuario').focus();
}

// Ocultar información
function ocultarInformacion() {
    document.getElementById('userInfoSection').classList.remove('active');
}

// Mostrar/ocultar indicador de carga
function mostrarCargando(estado) {
    const searchSection = document.querySelector('.search-section');
    const userInfoSection = document.getElementById('userInfoSection');
    
    if (estado) {
        searchSection.classList.add('loading');
        userInfoSection.classList.add('loading');
    } else {
        searchSection.classList.remove('loading');
        userInfoSection.classList.remove('loading');
    }
}

// Mostrar alerta
function mostrarAlerta(tipo, mensaje) {
    const alertDiv = document.getElementById('alertMessage');
    
    // Limpiar clases anteriores
    alertDiv.className = 'alert';
    
    // Agregar clase según tipo
    if (tipo === 'success') {
        alertDiv.classList.add('alert-success');
    } else if (tipo === 'error') {
        alertDiv.classList.add('alert-error');
    } else if (tipo === 'info') {
        alertDiv.classList.add('alert-info');
    }
    
    alertDiv.textContent = mensaje;
    alertDiv.classList.add('show');
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 5000);
}
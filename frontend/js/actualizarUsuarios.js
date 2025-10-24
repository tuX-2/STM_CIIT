// Variables globales
let usuarioActual = null;
const URL_BASE = '../backend/pruebas/actualizarUsuario.php';

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarPersonal();
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    const idUsuarioInput = document.getElementById('id_usuario');
    const form = document.getElementById('updateForm');
    
    // Buscar al presionar Enter
    idUsuarioInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarUsuario();
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        validarYActualizar();
    });
}

// Cargar lista de personal
function cargarPersonal() {
    fetch(URL_BASE + '?accion=obtenerPersonal')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('identificador_de_rh');
                select.innerHTML = '<option value="">Seleccione una persona</option>';
                
                data.data.forEach(persona => {
                    const option = document.createElement('option');
                    option.value = persona.id_personal;
                    option.textContent = persona.nombre_completo;
                    select.appendChild(option);
                });
                
                console.log('✅ Personal cargado:', data.data.length, 'registros');
            } else {
                mostrarAlerta('Id inexistente')
            }
        })
        .catch(error => {
            console.error('Error al cargar personal:', error);
            mostrarAlerta('error', 'Error de conexión al cargar el personal');
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
                llenarFormulario(data.data);
                mostrarAlerta('success', 'Usuario encontrado correctamente');
            } else {
                ocultarFormulario();
                mostrarAlerta('error', data.message);
            }
        })
        .catch(error => {
            mostrarCargando(false);
            console.error('Error:', error);
            mostrarAlerta('error', 'Error de conexión al buscar el usuario');
        });
}

// Llenar formulario con datos del usuario
function llenarFormulario(usuario) {
    // Mostrar información en el info-box
    document.getElementById('info_id').textContent = usuario.id_usuario;
    document.getElementById('info_nombre_usuario').textContent = usuario.nombre_usuario;
    
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
    
    // Llenar campos editables
    document.getElementById('correo_electronico').value = usuario.correo_electronico || '';
    document.getElementById('identificador_de_rh').value = usuario.identificador_de_rh || '';
    
    // Limpiar campos de contraseña
    document.getElementById('contrasena').value = '';
    document.getElementById('contrasena_confirmar').value = '';
    
    // Mostrar formulario
    document.getElementById('formSection').classList.add('active');
    
    // Enfocar en el primer campo editable
    document.getElementById('correo_electronico').focus();
}

// Validar y actualizar usuario
function validarYActualizar() {
    const contrasena = document.getElementById('contrasena').value;
    const contrasenaConfirmar = document.getElementById('contrasena_confirmar').value;
    
    // Validar contraseñas si se proporcionaron
    if (contrasena !== '' || contrasenaConfirmar !== '') {
        if (contrasena !== contrasenaConfirmar) {
            mostrarAlerta('error', 'Las contraseñas no coinciden');
            return;
        }
        
        if (contrasena.length < 6) {
            mostrarAlerta('error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
    }
    
    actualizarUsuario();
}

// Actualizar usuario
function actualizarUsuario() {
    const formData = new FormData();
    formData.append('accion', 'actualizarUsuario');
    formData.append('id_usuario', usuarioActual.id_usuario);
    formData.append('correo_electronico', document.getElementById('correo_electronico').value);
    formData.append('identificador_de_rh', document.getElementById('identificador_de_rh').value);
    
    // Solo enviar contraseña si se proporcionó
    const contrasena = document.getElementById('contrasena').value;
    if (contrasena !== '') {
        formData.append('contrasena', contrasena);
    }
    
    // Mostrar indicador de carga
    mostrarCargando(true);
    
    fetch(URL_BASE, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        mostrarCargando(false);
        
        if (data.success) {
            mostrarAlerta('success', data.message);
            // Recargar los datos del usuario
            setTimeout(() => {
                buscarUsuario();
            }, 1500);
        } else {
            mostrarAlerta('error', data.message);
        }
    })
    .catch(error => {
        mostrarCargando(false);
        console.error('Error:', error);
        mostrarAlerta('error', 'Error de conexión al actualizar el usuario');
    });
}

// Cancelar y limpiar
function cancelar() {
    if (confirm('¿Está seguro de cancelar? Se perderán los cambios no guardados.')) {
        ocultarFormulario();
        limpiarBusqueda();
        mostrarAlerta('info', 'Operación cancelada');
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('correo_electronico').value = '';
    document.getElementById('identificador_de_rh').value = '';
    document.getElementById('contrasena').value = '';
    document.getElementById('contrasena_confirmar').value = '';
    document.getElementById('correo_electronico').focus();
}

// Ocultar formulario
function ocultarFormulario() {
    document.getElementById('formSection').classList.remove('active');
    usuarioActual = null;
}

// Limpiar búsqueda
function limpiarBusqueda() {
    document.getElementById('id_usuario').value = '';
    document.getElementById('id_usuario').focus();
}

// Mostrar/ocultar indicador de carga
function mostrarCargando(estado) {
    const searchSection = document.querySelector('.search-section');
    const formSection = document.getElementById('formSection');
    
    if (estado) {
        searchSection.classList.add('loading');
        formSection.classList.add('loading');
    } else {
        searchSection.classList.remove('loading');
        formSection.classList.remove('loading');
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
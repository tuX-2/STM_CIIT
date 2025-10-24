// Variables globales
let personalCargado = false;

// Cargar personal al iniciar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarPersonal();
    configurarEventos();
});

// Configurar eventos del formulario
function configurarEventos() {
    const nombreUsuarioInput = document.getElementById('nombre_usuario');
    const form = document.getElementById('updateForm');
    const contrasenaInput = document.getElementById('contrasena');
    const contrasenaConfirmarInput = document.getElementById('contrasena_confirmar');
    
    // Buscar usuario al presionar Enter o Tab
    nombreUsuarioInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            buscarUsuario();
        }
    });
    
    // También buscar al perder el foco
    nombreUsuarioInput.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            buscarUsuario();
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar contraseñas si se proporcionaron
        const contrasena = contrasenaInput.value;
        const contrasenaConfirmar = contrasenaConfirmarInput.value;
        
        if (contrasena !== '' || contrasenaConfirmar !== '') {
            if (contrasena !== contrasenaConfirmar) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            if (contrasena.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
        }
        
        actualizarUsuario();
    });
    
    // Limpiar formulario
    form.addEventListener('reset', function() {
        document.getElementById('infoPersonal').style.display = 'none';
        nombreUsuarioInput.focus();
    });
}

// Cargar lista de personal
function cargarPersonal() {
    // AJUSTA LA RUTA SEGÚN TU ESTRUCTURA DE ARCHIVOS
    // Si tu HTML está en frontend/ y el PHP en backend/pruebas/:
    const urlPHP = '../backend/pruebas/actualizarUsuario.php?accion=obtenerPersonal';
    
    fetch(urlPHP)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.json();
        })
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
                
                personalCargado = true;
                console.log('Personal cargado correctamente:', data.data.length + ' registros');
            } else {
                console.error('Error al cargar personal:', data.message);
                alert('Error al cargar la lista de personal: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión al cargar el personal: ' + error.message);
        });
}

// Buscar usuario por nombre de usuario
function buscarUsuario() {
    const nombreUsuario = document.getElementById('nombre_usuario').value.trim();
    
    if (nombreUsuario === '') {
        alert('Por favor ingrese un nombre de usuario');
        return;
    }
    
    // Mostrar indicador de carga
    const form = document.getElementById('updateForm');
    form.style.opacity = '0.6';
    form.style.pointerEvents = 'none';
    
    // AJUSTA LA RUTA SEGÚN TU ESTRUCTURA
    const urlPHP = '../backend/pruebas/actualizarUsuario.php?accion=obtenerUsuario&nombre_usuario=' + 
                   encodeURIComponent(nombreUsuario);
    
    fetch(urlPHP)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            
            if (data.success) {
                llenarFormulario(data.data);
            } else {
                alert(data.message);
                limpiarCampos();
            }
        })
        .catch(error => {
            form.style.opacity = '1';
            form.style.pointerEvents = 'auto';
            console.error('Error:', error);
            alert('Error de conexión al buscar el usuario: ' + error.message);
        });
}

// Llenar formulario con datos del usuario
function llenarFormulario(usuario) {
    document.getElementById('correo_electronico').value = usuario.correo_electronico || '';
    document.getElementById('identificador_de_rh').value = usuario.identificador_de_rh || '';
    
    // Mostrar información del personal asociado
    if (usuario.nombre_personal) {
        const nombreCompleto = (usuario.nombre_personal + ' ' + 
                               usuario.apellido_paterno + ' ' + 
                               (usuario.apellido_materno || '')).trim();
        document.getElementById('info_nombre').textContent = nombreCompleto;
        document.getElementById('infoPersonal').style.display = 'block';
    } else {
        document.getElementById('infoPersonal').style.display = 'none';
    }
    
    // Limpiar campos de contraseña
    document.getElementById('contrasena').value = '';
    document.getElementById('contrasena_confirmar').value = '';
    
    // Enfocar en el siguiente campo
    document.getElementById('correo_electronico').focus();
}

// Limpiar campos del formulario (excepto nombre de usuario)
function limpiarCampos() {
    document.getElementById('correo_electronico').value = '';
    document.getElementById('identificador_de_rh').value = '';
    document.getElementById('contrasena').value = '';
    document.getElementById('contrasena_confirmar').value = '';
    document.getElementById('infoPersonal').style.display = 'none';
}

// Actualizar usuario
function actualizarUsuario() {
    const form = document.getElementById('updateForm');
    const formData = new FormData(form);
    formData.append('accion', 'actualizarUsuario');
    
    // Si la contraseña está vacía, no enviarla
    if (document.getElementById('contrasena').value === '') {
        formData.delete('contrasena');
    }
    
    // Remover el campo de confirmación (no se guarda en BD)
    formData.delete('contrasena_confirmar');
    
    // Mostrar indicador de carga
    form.style.opacity = '0.6';
    form.style.pointerEvents = 'none';
    
    // AJUSTA LA RUTA SEGÚN TU ESTRUCTURA
    const urlPHP = '../backend/pruebas/actualizarUsuario.php';
    
    fetch(urlPHP, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error HTTP: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        
        if (data.success) {
            alert(data.message);
            // Recargar los datos del usuario
            buscarUsuario();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        console.error('Error:', error);
        alert('Error de conexión al actualizar el usuario: ' + error.message);
    });
}
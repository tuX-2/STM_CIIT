document.addEventListener('DOMContentLoaded', function() {
    const curpBusquedaInput = document.getElementById('curp_busqueda');
    const curpInput = document.getElementById('curp');
    const idPersonalInput = document.getElementById('id_personal');
    const formulario = document.getElementById('updateForm');
    const afiliacionSelect = document.getElementById('afiliacion_laboral');
    
    // Cargar localidades al iniciar
    cargarLocalidades();
    
    // Evento cuando se presiona Enter o Tab en el campo CURP de búsqueda
    curpBusquedaInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            buscarPersonal();
        }
    });
    
    // También buscar cuando pierde el foco
    curpBusquedaInput.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
            buscarPersonal();
        }
    });
    
    // Función para cargar localidades
    function cargarLocalidades() {
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
                alert('Error al cargar las localidades');
            });
    }
    
    // Función para buscar personal por CURP
    function buscarPersonal() {
        const curpBusqueda = curpBusquedaInput.value.trim().toUpperCase();
        
        if (curpBusqueda.length !== 18) {
            alert('La CURP debe tener 18 caracteres');
            return;
        }
        
        curpBusquedaInput.disabled = true;
        
        fetch(`../backend/actualizarEliminarPersonal.php?accion=obtenerPersonal&curp=${encodeURIComponent(curpBusqueda)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    llenarFormulario(data.data);
                } else {
                    alert(data.message || 'Personal no encontrado');
                    limpiarFormulario();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al buscar el personal');
            })
            .finally(() => {
                curpBusquedaInput.disabled = false;
            });
    }
    
    // Función para llenar el formulario
    function llenarFormulario(datos) {
        // Guardar el ID del personal (clave para actualizar)
        idPersonalInput.value = datos.id_personal || '';
        
        // Llenar todos los campos, incluyendo CURP editable
        curpInput.value = datos.curp || '';
        document.getElementById('nombre_personal').value = datos.nombre_personal || '';
        document.getElementById('apellido_paterno').value = datos.apellido_paterno || '';
        document.getElementById('apellido_materno').value = datos.apellido_materno || '';
        document.getElementById('afiliacion_laboral').value = datos.afiliacion_laboral || '';
        document.getElementById('cargo').value = datos.cargo || '';
        
        // Habilitar campos para edición
        habilitarCampos(true);
    }
    
    // Función para limpiar formulario
    function limpiarFormulario() {
        idPersonalInput.value = '';
        curpInput.value = '';
        document.getElementById('nombre_personal').value = '';
        document.getElementById('apellido_paterno').value = '';
        document.getElementById('apellido_materno').value = '';
        document.getElementById('afiliacion_laboral').value = '';
        document.getElementById('cargo').value = '';
        
        habilitarCampos(false);
    }
    
    // Función para habilitar/deshabilitar campos
    function habilitarCampos(habilitar) {
        const campos = ['curp', 'nombre_personal', 'apellido_paterno', 'apellido_materno', 
                       'afiliacion_laboral', 'cargo'];
        
        campos.forEach(campo => {
            document.getElementById(campo).disabled = !habilitar;
        });
    }
    
    // Manejar el envío del formulario
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que se haya cargado un personal
        if (!idPersonalInput.value) {
            alert('Debe buscar un personal válido antes de actualizar');
            return;
        }
        
        // Validar que la CURP nueva tenga 18 caracteres
        if (curpInput.value.trim().length !== 18) {
            alert('La CURP debe tener 18 caracteres');
            return;
        }
        
        // Confirmar actualización
        if (!confirm('¿Está seguro de actualizar los datos de este personal?')) {
            return;
        }
        
        // Recopilar datos del formulario
        const formData = new FormData(formulario);
        formData.append('accion', 'actualizarPersonal');
        
        // Enviar datos
        fetch('../backend/actualizarEliminarPersonal.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Datos actualizados correctamente');
                // Actualizar el campo de búsqueda con la nueva CURP
                curpBusquedaInput.value = curpInput.value;
            } else {
                alert('Error al actualizar: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar los datos');
        });
    });
    
    // Manejar botón de limpiar
    formulario.addEventListener('reset', function() {
        limpiarFormulario();
        curpBusquedaInput.value = '';
    });
    
    // Inicializar formulario deshabilitado
    habilitarCampos(false);
    
    // Convertir CURPs a mayúsculas automáticamente
    curpBusquedaInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
    
    curpInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
});
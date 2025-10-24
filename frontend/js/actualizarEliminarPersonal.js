document.addEventListener('DOMContentLoaded', function() {
    const curpInput = document.getElementById('curp');
    const formulario = document.getElementById('updateForm');
    const afiliacionSelect = document.getElementById('afiliacion_laboral');
    
    let curpOriginal = ''; // Para almacenar la CURP original
    
    // Cargar localidades al iniciar
    cargarLocalidades();
    
    // Evento cuando se presiona Enter o Tab en el campo CURP
    curpInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            buscarPersonal();
        }
    });
    
    // También buscar cuando pierde el foco
    curpInput.addEventListener('blur', function() {
        if (this.value.trim() !== '' && this.value !== curpOriginal) {
            buscarPersonal();
        }
    });
    
    // Función para cargar localidades
    function cargarLocalidades() {
        fetch('../backend/actualizarEliminarPersonal.php?accion=obtenerLocalidades')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Limpiar opciones existentes excepto la primera
                    afiliacionSelect.innerHTML = '<option value="">Seleccione una opcion</option>';
                    
                    // Agregar localidades
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
        const curp = curpInput.value.trim().toUpperCase();
        
        if (curp.length !== 18) {
            alert('La CURP debe tener 18 caracteres');
            return;
        }
        
        // Mostrar indicador de carga
        curpInput.disabled = true;
        
        fetch(`../backend/actualizarEliminarPersonal.php?accion=obtenerPersonal&curp=${encodeURIComponent(curp)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Llenar formulario con datos
                    llenarFormulario(data.data);
                    curpOriginal = curp;
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
                curpInput.disabled = false;
            });
    }
    
    // Función para llenar el formulario
    function llenarFormulario(datos) {
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
        document.getElementById('nombre_personal').value = '';
        document.getElementById('apellido_paterno').value = '';
        document.getElementById('apellido_materno').value = '';
        document.getElementById('afiliacion_laboral').value = '';
        document.getElementById('cargo').value = '';
        curpOriginal = '';
        
        habilitarCampos(false);
    }
    
    // Función para habilitar/deshabilitar campos
    function habilitarCampos(habilitar) {
        const campos = ['nombre_personal', 'apellido_paterno', 'apellido_materno', 
                       'afiliacion_laboral', 'cargo'];
        
        campos.forEach(campo => {
            document.getElementById(campo).disabled = !habilitar;
        });
    }
    
    // Manejar el envío del formulario
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar que se haya cargado un personal
        if (!curpOriginal) {
            alert('Debe buscar un personal válido antes de actualizar');
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
                // Opcional: limpiar formulario o recargar datos
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
        curpInput.value = '';
    });
    
    // Inicializar formulario deshabilitado
    habilitarCampos(false);
    
    // Convertir CURP a mayúsculas automáticamente
    curpInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
});
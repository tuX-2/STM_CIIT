// ingresar_producto.js
document.addEventListener('DOMContentLoaded', function() {
    
    // Cargar localidades desde el servidor
    cargarLocalidades();
    
    // Cargar tipos de embalaje
    cargarTiposEmbalaje();
    
    // Cargar tipos de mercancía
    cargarTiposMercancia();
    
    // Configurar validaciones en tiempo real
    configurarValidacionesTiempoReal();
    
    // Calcular peso volumétrico automáticamente
    const camposVolumen = ['largo', 'ancho', 'altura', 'peso'];
    camposVolumen.forEach(campo => {
        document.getElementById(campo).addEventListener('input', calcularPesoVolumetrico);
    });
    
    // Manejador del formulario
    document.getElementById('formProducto').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFormulario()) {
            guardarProducto();
        }
    });
    
    // Botón limpiar
    document.getElementById('btnLimpiar').addEventListener('click', limpiarFormulario);
    
    // Botón cancelar
    document.getElementById('btnCancelar').addEventListener('click', function() {
        // Verificar si hay datos en el formulario
        const formData = new FormData(document.getElementById('formProducto'));
        let hayDatos = false;
        
        for (let [key, value] of formData.entries()) {
            if (value && value.trim() !== '') {
                hayDatos = true;
                break;
            }
        }
        
        // Si hay datos, pedir confirmación
        if (hayDatos) {
            if (confirm('¿Está seguro de que desea cancelar? Los datos no guardados se perderán.')) {
                window.location.href = '/panel_general.html';
            }
        } else {
            // Si no hay datos, regresar directamente
            window.location.href = '/panel_general.html';
        }
    });
});

function configurarValidacionesTiempoReal() {
    
    // Validación para nombre_producto (solo letras, números, espacios y acentos)
    const nombreProducto = document.getElementById('nombre_producto');
    nombreProducto.addEventListener('input', function(e) {
        let valor = e.target.value;
        let valorLimpio = valor.replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]/g, '');
        
        if (valor !== valorLimpio) {
            e.target.value = valorLimpio;
        }
        
        if (valorLimpio.trim() === '') {
            mostrarError('nombre_producto', 'El nombre del producto es obligatorio.');
        } else {
            limpiarError('nombre_producto');
        }
    });
    
    // Validación para ubicación
    const ubicacion = document.getElementById('ubicacion_producto');
    ubicacion.addEventListener('change', function(e) {
        if (e.target.value === '') {
            mostrarError('ubicacion_producto', 'Es obligatoria la selección de una localidad.');
        } else {
            limpiarError('ubicacion_producto');
        }
    });
    
    // Validaciones para campos numéricos decimales
    document.getElementById('peso').addEventListener('input', function(e) {
        validarNumeroPositivoDecimal(e, 'peso', 'El peso debe ser un número válido y mayor a 0 kilogramos');
    });
    
    document.getElementById('altura').addEventListener('input', function(e) {
        validarNumeroPositivoDecimal(e, 'altura', 'La altura debe ser mayor a 0 metros.');
    });
    
    document.getElementById('largo').addEventListener('input', function(e) {
        validarNumeroPositivoDecimal(e, 'largo', 'El largo debe ser mayor a 0 metros.');
    });
    
    document.getElementById('ancho').addEventListener('input', function(e) {
        validarNumeroPositivoDecimal(e, 'ancho', 'El ancho debe ser mayor a 0 metros.');
    });
    
    document.getElementById('peso_soportado').addEventListener('input', function(e) {
        validarNumeroPositivoDecimal(e, 'peso_soportado', 'El peso soportado debe ser positivo.');
    });
    
    // Validaciones para campos enteros
    document.getElementById('cajas_por_cama').addEventListener('input', function(e) {
        validarEnteroPositivo(e, 'cajas_por_cama', 'Ingrese un número válido de cajas por cama.');
    });
    
    document.getElementById('camas_por_pallet').addEventListener('input', function(e) {
        validarEnteroPositivo(e, 'camas_por_pallet', 'Ingrese un número válido de camas por pallet.');
    });
    
    document.getElementById('unidades_existencia').addEventListener('input', function(e) {
        validarEnteroCeroOPositivo(e, 'unidades_existencia', 'Ingrese un número válido para las unidades en existencia.');
    });
    
    // Validación para tipo_de_embalaje
    document.getElementById('tipo_de_embalaje').addEventListener('change', function(e) {
        if (e.target.value === '') {
            mostrarError('tipo_de_embalaje', 'Seleccione un tipo de embalaje válido.');
        } else {
            limpiarError('tipo_de_embalaje');
        }
    });
    
    // Validación para tipo_de_mercancia
    document.getElementById('tipo_de_mercancia').addEventListener('change', function(e) {
        if (e.target.value === '') {
            mostrarError('tipo_de_mercancia', 'Seleccione un tipo de mercancía válida.');
        } else {
            limpiarError('tipo_de_mercancia');
        }
    });
}

function validarNumeroPositivoDecimal(evento, campo, mensajeError) {
    let valor = evento.target.value;
    
    // Permitir solo números, punto decimal y un signo menos al inicio
    let valorLimpio = valor.replace(/[^\d.]/g, '');
    
    // Asegurar que solo haya un punto decimal
    const partes = valorLimpio.split('.');
    if (partes.length > 2) {
        valorLimpio = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (partes.length === 2 && partes[1].length > 2) {
        valorLimpio = partes[0] + '.' + partes[1].substring(0, 2);
    }
    
    if (valor !== valorLimpio) {
        evento.target.value = valorLimpio;
    }
    
    const numero = parseFloat(valorLimpio);
    
    if (valorLimpio === '' || isNaN(numero) || numero <= 0) {
        mostrarError(campo, mensajeError);
    } else {
        limpiarError(campo);
    }
}

function validarEnteroPositivo(evento, campo, mensajeError) {
    let valor = evento.target.value;
    
    // Permitir solo números enteros
    let valorLimpio = valor.replace(/[^\d]/g, '');
    
    if (valor !== valorLimpio) {
        evento.target.value = valorLimpio;
    }
    
    const numero = parseInt(valorLimpio);
    
    if (valorLimpio === '' || isNaN(numero) || numero <= 0) {
        mostrarError(campo, mensajeError);
    } else {
        limpiarError(campo);
    }
}

function validarEnteroCeroOPositivo(evento, campo, mensajeError) {
    let valor = evento.target.value;
    
    // Permitir solo números enteros
    let valorLimpio = valor.replace(/[^\d]/g, '');
    
    if (valor !== valorLimpio) {
        evento.target.value = valorLimpio;
    }
    
    const numero = parseInt(valorLimpio);
    
    if (valorLimpio === '' || isNaN(numero) || numero < 0) {
        mostrarError(campo, mensajeError);
    } else {
        limpiarError(campo);
    }
}

function cargarLocalidades() {
    fetch('../backend/obtener_localidades.php')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('ubicacion_producto');
            data.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.id_localidad;
                option.textContent = localidad.nombre_centro_trabajo;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar localidades:', error);
            mostrarError('ubicacion_producto', 'Error al cargar las localidades disponibles.');
        });
}

function cargarTiposEmbalaje() {
    const tiposEmbalaje = [
        'Envase simple',
        'Envase combinado',
        'Envase interior',
        'Envase exterior',
        'Envase intermedio',
        'Recipiente intermedio para granel (RIG / IBC)',
        'Gran embalaje (LP)',
        'Tambor metálico',
        'Tambor de plástico',
        'Bidón metálico',
        'Bidón de plástico',
        'Caja de madera',
        'Caja de cartón / fibra',
        'Caja de plástico',
        'Caja metálica',
        'Bolsa de plástico',
        'Bolsa de papel',
        'Frasco o botella de vidrio',
        'Frasco o botella de plástico',
        'Garrafa o contenedor de vidrio / gres',
        'Contenedor a presión (cilindro, tanque portátil)',
        'Embalaje compuesto (varios materiales)',
        'Embalaje con flejes o ligaduras',
        'Embalaje interior rígido',
        'Envase reutilizable o retornable',
        'Embalaje para cantidades limitadas',
        'Embalaje para residuos peligrosos',
        'Embalaje especial para líquidos corrosivos',
        'Embalaje especial para materiales explosivos'
    ];
    
    const select = document.getElementById('tipo_de_embalaje');
    // Limpia las opciones existentes antes de agregar las nuevas
    select.innerHTML = '<option value="">Seleccione un tipo de embalaje</option>';
    
    tiposEmbalaje.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}


function cargarTiposMercancia() {
    const tiposMercancia = [
        'Mercancías peligrosas',
        'Sustancias peligrosas',
        'Materiales peligrosos',
        'Residuos peligrosos',
        'Mercancías en cantidades limitadas',
        'Mercancías en cantidades exceptuadas',
        'Mercancías no peligrosas',
        'Mercancías comunes / generales',
        'Mercancías para consumo final',
        'Mercancías a granel',
        'Mercancías en envases especiales',
        'Mercancías transportadas en tanque/autotanque',
        'Clase 1 - Explosivos',
        'Clase 2 - Gases',
        'Clase 3 - Líquidos inflamables',
        'Clase 4 - Sólidos inflamables / combustión espontánea / reacción con agua',
        'Clase 5 - Sustancias comburentes y peróxidos orgánicos',
        'Clase 6 - Sustancias tóxicas e infecciosas',
        'Clase 7 - Materiales radiactivos',
        'Clase 8 - Sustancias corrosivas',
        'Clase 9 - Sustancias peligrosas varias / misceláneas'
    ];
    
    const select = document.getElementById('tipo_de_mercancia');
    tiposMercancia.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}

function calcularPesoVolumetrico() {
    const largo = parseFloat(document.getElementById('largo').value) || 0;
    const ancho = parseFloat(document.getElementById('ancho').value) || 0;
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    
    const pesoVolumetricoInput = document.getElementById('peso_volumetrico');
    
    // Solo calcular si todos los valores son mayores a 0
    if (largo > 0 && ancho > 0 && altura > 0 && peso > 0) {
        // Factor de conversión estándar para transporte terrestre: 167 (kg/m³)
        // Fórmula: (largo × ancho × altura) × 167
        const volumen = largo * ancho * altura;
        const pesoVolumetrico = (volumen * 167).toFixed(2);
        
        pesoVolumetricoInput.value = pesoVolumetrico;
        limpiarError('peso_volumetrico');
    } else {
        pesoVolumetricoInput.value = '';
        if (largo > 0 || ancho > 0 || altura > 0 || peso > 0) {
            mostrarError('peso_volumetrico', 'Complete todos los campos de dimensiones y peso para calcular.');
        }
    }
}

function validarFormulario() {
    let esValido = true;
    
    // Limpiar todos los errores previos
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Validar nombre_producto
    const nombreProducto = document.getElementById('nombre_producto').value.trim();
    if (nombreProducto === '') {
        mostrarError('nombre_producto', 'El nombre del producto es obligatorio.');
        esValido = false;
    } else if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/.test(nombreProducto)) {
        mostrarError('nombre_producto', 'Debe ingresar un nombre de producto válido.');
        esValido = false;
    }
    
    // Validar ubicación
    const ubicacion = document.getElementById('ubicacion_producto').value;
    if (ubicacion === '') {
        mostrarError('ubicacion_producto', 'Es obligatoria la selección de una localidad.');
        esValido = false;
    }
    
    // Validar peso
    const peso = parseFloat(document.getElementById('peso').value);
    if (isNaN(peso) || peso <= 0) {
        mostrarError('peso', 'El peso debe ser un número válido y mayor a 0 kilogramos');
        esValido = false;
    }
    
    // Validar altura
    const altura = parseFloat(document.getElementById('altura').value);
    if (isNaN(altura) || altura <= 0) {
        mostrarError('altura', 'La altura debe ser mayor a 0 metros.');
        esValido = false;
    }
    
    // Validar largo
    const largo = parseFloat(document.getElementById('largo').value);
    if (isNaN(largo) || largo <= 0) {
        mostrarError('largo', 'El largo debe ser mayor a 0 metros.');
        esValido = false;
    }
    
    // Validar ancho
    const ancho = parseFloat(document.getElementById('ancho').value);
    if (isNaN(ancho) || ancho <= 0) {
        mostrarError('ancho', 'El ancho debe ser mayor a 0 metros.');
        esValido = false;
    }
    
    // Validar cajas_por_cama
    const cajasCama = parseInt(document.getElementById('cajas_por_cama').value);
    if (isNaN(cajasCama) || cajasCama <= 0 || !Number.isInteger(cajasCama)) {
        mostrarError('cajas_por_cama', 'Ingrese un número válido de cajas por cama.');
        esValido = false;
    }
    
    // Validar camas_por_pallet
    const camasPallet = parseInt(document.getElementById('camas_por_pallet').value);
    if (isNaN(camasPallet) || camasPallet <= 0 || !Number.isInteger(camasPallet)) {
        mostrarError('camas_por_pallet', 'Ingrese un número válido de camas por pallet.');
        esValido = false;
    }
    
    // Validar peso_soportado
    const pesoSoportado = parseFloat(document.getElementById('peso_soportado').value);
    if (isNaN(pesoSoportado) || pesoSoportado <= 0) {
        mostrarError('peso_soportado', 'El peso soportado debe ser positivo.');
        esValido = false;
    }
    
    // Validar peso_volumetrico
    const pesoVolumetrico = parseFloat(document.getElementById('peso_volumetrico').value);
    if (isNaN(pesoVolumetrico) || pesoVolumetrico <= 0) {
        mostrarError('peso_volumetrico', 'No se pudo calcular el peso volumétrico. Verifique los campos de peso o dimensiones');
        esValido = false;
    }
    
    // Validar unidades_existencia
    const unidadesExistencia = parseInt(document.getElementById('unidades_existencia').value);
    if (isNaN(unidadesExistencia) || unidadesExistencia < 0 || !Number.isInteger(unidadesExistencia)) {
        mostrarError('unidades_existencia', 'Ingrese un número válido para las unidades en existencia.');
        esValido = false;
    }
    
    // Validar tipo_de_embalaje
    const tipoEmbalaje = document.getElementById('tipo_de_embalaje').value;
    if (tipoEmbalaje === '') {
        mostrarError('tipo_de_embalaje', 'Seleccione un tipo de embalaje válido.');
        esValido = false;
    }
    
    // Validar tipo_de_mercancia
    const tipoMercancia = document.getElementById('tipo_de_mercancia').value;
    if (tipoMercancia === '') {
        mostrarError('tipo_de_mercancia', 'Seleccione un tipo de mercancía válida.');
        esValido = false;
    }
    
    return esValido;
}

function mostrarError(campo, mensaje) {
    const input = document.getElementById(campo);
    const errorSpan = document.getElementById('error_' + campo);
    
    input.classList.add('error');
    errorSpan.textContent = mensaje;
    errorSpan.classList.add('show');
}

function limpiarError(campo) {
    const input = document.getElementById(campo);
    const errorSpan = document.getElementById('error_' + campo);
    
    input.classList.remove('error');
    errorSpan.classList.remove('show');
}

function guardarProducto() {
    const formData = new FormData(document.getElementById('formProducto'));
    
    // Debug: Mostrar todos los datos que se están enviando
    console.log('Datos del formulario:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    fetch('../backend/ingresar_producto.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        // Primero obtener el texto de la respuesta
        return response.text().then(text => {
            console.log('Respuesta del servidor:', text);
            try {
                // Intentar parsear como JSON
                return JSON.parse(text);
            } catch (e) {
                console.error('Error al parsear JSON. Respuesta completa:', text);
                throw new Error('El servidor no devolvió un JSON válido. Ver consola para detalles.');
            }
        });
    })
    .then(data => {
        if (data.success) {
            mostrarMensajeExito('Producto ingresado correctamente.');
            limpiarFormulario();
        } else {
            if (data.error && data.error.includes('Ya existe')) {
                mostrarError('nombre_producto', data.error);
            } else {
                alert('Error al guardar el producto: ' + (data.error || 'Error desconocido'));
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error: ' + error.message + '\nRevise la consola para más detalles.');
    });
}

function mostrarMensajeExito(mensaje) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = mensaje;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 5000);
}

function limpiarFormulario() {
    document.getElementById('formProducto').reset();
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.getElementById('peso_volumetrico').value = '';
}
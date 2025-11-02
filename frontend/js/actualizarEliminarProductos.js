
// Factor de conversión estándar para transporte (puede ajustarse según necesidad)
const FACTOR_CONVERSION = 167; // kg/m³ (estándar en logística)

// Variable global para almacenar todos los productos
let todosLosProductos = [];

// Cargar lista de productos al iniciar
window.addEventListener('DOMContentLoaded', function() {
    cargarListaProductos();
    configurarBuscador();
});

// Configurar el buscador con autocompletado
function configurarBuscador() {
    const buscador = document.getElementById('buscador_producto');
    const sugerencias = document.getElementById('sugerencias');
    
    if (!buscador || !sugerencias) {
        console.error('No se encontraron los elementos del buscador');
        return;
    }
    
    // Evento al escribir
    buscador.addEventListener('input', function() {
        const texto = this.value.trim().toLowerCase();
        
        if (texto.length === 0) {
            ocultarSugerencias();
            return;
        }
        
        // Filtrar productos que coincidan
        const productosFiltrados = todosLosProductos.filter(producto => 
            producto.nombre_producto.toLowerCase().includes(texto)
        );
        
        mostrarSugerencias(productosFiltrados);
    });
    
    // Evitar que se cierre al hacer clic en el input
    buscador.addEventListener('click', function(e) {
        e.stopPropagation();
        if (this.value.trim().length > 0) {
            const texto = this.value.trim().toLowerCase();
            const productosFiltrados = todosLosProductos.filter(producto => 
                producto.nombre_producto.toLowerCase().includes(texto)
            );
            mostrarSugerencias(productosFiltrados);
        }
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!buscador.contains(e.target) && !sugerencias.contains(e.target)) {
            ocultarSugerencias();
        }
    });
}

// Mostrar sugerencias
function mostrarSugerencias(productos) {
    const sugerencias = document.getElementById('sugerencias');
    sugerencias.innerHTML = '';
    
    if (productos.length === 0) {
        sugerencias.innerHTML = '<div class="no-resultados">No se encontraron productos</div>';
        sugerencias.classList.add('activo');
        return;
    }
    
    productos.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'sugerencia-item';
        item.innerHTML = `
            <span class="sugerencia-nombre">${producto.nombre_producto}</span>
            <span class="sugerencia-id">(ID: ${producto.id_producto})</span>
        `;
        
        // Prevenir que el click cierre las sugerencias inmediatamente
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            seleccionarProducto(producto.id_producto, producto.nombre_producto);
        });
        
        sugerencias.appendChild(item);
    });
    
    sugerencias.classList.add('activo');
}

// Ocultar sugerencias
function ocultarSugerencias() {
    const sugerencias = document.getElementById('sugerencias');
    if (sugerencias) {
        sugerencias.classList.remove('activo');
    }
}

// Seleccionar un producto desde las sugerencias
function seleccionarProducto(id, nombre) {
    console.log('Producto seleccionado:', id, nombre);
    document.getElementById('buscador_producto').value = nombre;
    ocultarSugerencias();
    cargarProductoPorId(id);
}

// Cargar la lista de productos en memoria
async function cargarListaProductos() {
    try {
        const response = await fetch('/backend/actualizarEliminarProductos.php?action=listar');
        const data = await response.json();
        
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            todosLosProductos = data.data;
            console.log('Productos cargados:', todosLosProductos.length);
        } else {
            mostrarMensaje('Error al cargar productos: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error en cargarListaProductos:', error);
        mostrarMensaje('Error de conexión: ' + error.message, 'error');
    }
}

// Cargar producto por ID
async function cargarProductoPorId(id) {
    console.log('Cargando producto con ID:', id);
    
    try {
        const response = await fetch(`/backend/actualizarEliminarProductos.php?action=obtener&id=${id}`);
        const data = await response.json();
        
        console.log('Datos del producto:', data);
        
        if (data.success) {
            const producto = data.data;
            
            document.getElementById('id_producto').value = producto.id_producto;
            document.getElementById('nombre_producto').value = producto.nombre_producto || '';
            document.getElementById('ubicacion_producto').value = producto.ubicacion_producto || '';
            document.getElementById('peso').value = producto.peso || '';
            document.getElementById('altura').value = producto.altura || '';
            document.getElementById('cajas_por_cama').value = producto.cajas_por_cama || '';
            document.getElementById('camas_por_pallet').value = producto.camas_por_pallet || '';
            document.getElementById('peso_soportado').value = producto.peso_soportado || '';
            document.getElementById('peso_volumetrico').value = producto.peso_volumetrico || '';
            document.getElementById('unidades_existencia').value = producto.unidades_existencia || '';
            document.getElementById('tipo_de_embalaje').value = producto.tipo_de_embalaje || '';
            document.getElementById('tipo_de_mercancia').value = producto.tipo_de_mercancia || '';
            
            // Limpiar largo y ancho (no están en BD)
            document.getElementById('largo').value = '';
            document.getElementById('ancho').value = '';
            
            mostrarMensaje('Producto cargado correctamente', 'exito');
        } else {
            mostrarMensaje('Error al cargar producto: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error en cargarProductoPorId:', error);
        mostrarMensaje('Error de conexión: ' + error.message, 'error');
    }
}

// Calcular peso volumétrico automáticamente
function calcularPesoVolumetrico() {
    const altura = parseFloat(document.getElementById('altura').value) || 0;
    const largo = parseFloat(document.getElementById('largo').value) || 0;
    const ancho = parseFloat(document.getElementById('ancho').value) || 0;
    
    if (altura > 0 && largo > 0 && ancho > 0) {
        // Volumen en m³
        const volumen = altura * largo * ancho;
        
        // Peso volumétrico = Volumen (m³) × Factor de conversión (kg/m³)
        const pesoVolumetrico = volumen * FACTOR_CONVERSION;
        
        document.getElementById('peso_volumetrico').value = pesoVolumetrico.toFixed(2);
    }
}

// Guardar cambios del producto
async function guardarProducto() {
    const id = document.getElementById('id_producto').value;
    
    if (!id) {
        mostrarMensaje('Debe seleccionar un producto', 'error');
        return;
    }
    
    const datos = {
        id_producto: id,
        nombre_producto: document.getElementById('nombre_producto').value,
        ubicacion_producto: document.getElementById('ubicacion_producto').value,
        peso: document.getElementById('peso').value,
        altura: document.getElementById('altura').value,
        cajas_por_cama: document.getElementById('cajas_por_cama').value,
        camas_por_pallet: document.getElementById('camas_por_pallet').value,
        peso_soportado: document.getElementById('peso_soportado').value,
        peso_volumetrico: document.getElementById('peso_volumetrico').value,
        unidades_existencia: document.getElementById('unidades_existencia').value,
        tipo_de_embalaje: document.getElementById('tipo_de_embalaje').value,
        tipo_de_mercancia: document.getElementById('tipo_de_mercancia').value
    };
    
    console.log('Guardando producto:', datos);
    
    try {
        const response = await fetch('/backend/actualizarEliminarProductos.php?action=actualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const data = await response.json();
        
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            mostrarMensaje('Producto actualizado correctamente', 'exito');
            // Recargar la lista por si cambió el nombre
            await cargarListaProductos();
        } else {
            mostrarMensaje('Error al actualizar: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error en guardarProducto:', error);
        mostrarMensaje('Error de conexión: ' + error.message, 'error');
    }
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('buscador_producto').value = '';
    document.getElementById('id_producto').value = '';
    document.getElementById('nombre_producto').value = '';
    document.getElementById('ubicacion_producto').value = '';
    document.getElementById('peso').value = '';
    document.getElementById('altura').value = '';
    document.getElementById('largo').value = '';
    document.getElementById('ancho').value = '';
    document.getElementById('cajas_por_cama').value = '';
    document.getElementById('camas_por_pallet').value = '';
    document.getElementById('peso_soportado').value = '';
    document.getElementById('peso_volumetrico').value = '';
    document.getElementById('unidades_existencia').value = '';
    document.getElementById('tipo_de_embalaje').value = '';
    document.getElementById('tipo_de_mercancia').value = '';
    
    ocultarMensaje();
    ocultarSugerencias();
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
    mensaje.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(ocultarMensaje, 5000);
}

// Ocultar mensaje
function ocultarMensaje() {
    const mensaje = document.getElementById('mensaje');
    mensaje.style.display = 'none';
}
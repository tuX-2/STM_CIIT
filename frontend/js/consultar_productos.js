// consultar_productos.js
document.addEventListener('DOMContentLoaded', function() {
    
    // Cargar opciones de filtros
    cargarLocalidades();
    cargarTiposEmbalaje();
    cargarTiposMercancia();
    
    // Manejador del formulario
    document.getElementById('formConsulta').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validarFiltros()) {
            consultarProductos();
        }
    });
    
    // Botón limpiar
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Botón cancelar
    document.getElementById('btnCancelar').addEventListener('click', function() {
        window.location.href = 'panel_general.html';
    });
});

function cargarLocalidades() {
    fetch('/../backend/obtener_localidades.php')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('filtro_ubicacion');
            data.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.id_localidad;
                option.textContent = localidad.nombre_centro_trabajo;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar localidades:', error);
        });
}

function cargarTiposEmbalaje() {
    const tiposEmbalaje = [
        'Caja de cartón',
        'Contenedor plástico',
        'Caja de madera',
        'Pallet',
        'Bolsa',
        'Tambor',
        'Bidón',
        'Saco'
    ];
    
    const select = document.getElementById('filtro_tipo_embalaje');
    tiposEmbalaje.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}

function cargarTiposMercancia() {
    const tiposMercancia = [
        'Perecedera',
        'No perecedera',
        'Frágil',
        'Peligrosa',
        'General',
        'Congelada',
        'Refrigerada'
    ];
    
    const select = document.getElementById('filtro_tipo_mercancia');
    tiposMercancia.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });
}

function validarFiltros() {
    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    
    const nombre = document.getElementById('filtro_nombre').value.trim();
    const ubicaciones = Array.from(document.getElementById('filtro_ubicacion').selectedOptions).map(opt => opt.value);
    const tiposMercancia = Array.from(document.getElementById('filtro_tipo_mercancia').selectedOptions).map(opt => opt.value);
    const tiposEmbalaje = Array.from(document.getElementById('filtro_tipo_embalaje').selectedOptions).map(opt => opt.value);
    const rangosPeso = Array.from(document.getElementById('filtro_rango_peso').selectedOptions).map(opt => opt.value);
    
    // Verificar que al menos un criterio esté seleccionado
    const hayCriterios = nombre !== '' || 
                         ubicaciones.length > 0 || 
                         tiposMercancia.length > 0 || 
                         tiposEmbalaje.length > 0 || 
                         rangosPeso.length > 0;
    
    if (!hayCriterios) {
        mostrarError('filtro_nombre', 'Debe especificar al menos un criterio de búsqueda.');
        return false;
    }
    
    return true;
}

function mostrarError(campo, mensaje) {
    const errorSpan = document.getElementById('error_' + campo);
    errorSpan.textContent = mensaje;
    errorSpan.classList.add('show');
}

function consultarProductos() {
    const formData = new FormData(document.getElementById('formConsulta'));
    
    fetch('/../backend/consultar_productos.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarResultados(data.productos);
        } else {
            alert('Error al consultar productos: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al comunicarse con el servidor.');
    });
}

function mostrarResultados(productos) {
    const resultadosSection = document.getElementById('resultadosSection');
    const tablaBody = document.getElementById('tablaResultadosBody');
    const totalResultados = document.getElementById('totalResultados');
    
    // Limpiar tabla
    tablaBody.innerHTML = '';
    
    if (productos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="8" class="no-resultados">No se encontraron productos con los criterios especificados.</td></tr>';
    } else {
        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(producto.nombre_producto)}</td>
                <td>${escapeHtml(producto.nombre_localidad)}</td>
                <td>${escapeHtml(producto.tipo_de_mercancia)}</td>
                <td>${escapeHtml(producto.tipo_de_embalaje)}</td>
                <td>${parseFloat(producto.peso).toFixed(2)}</td>
                <td>${parseFloat(producto.altura).toFixed(2)}</td>
                <td>${parseFloat(producto.peso_volumetrico).toFixed(2)}</td>
                <td>${producto.unidades_existencia}</td>
            `;
            tablaBody.appendChild(row);
        });
    }
    
    // Actualizar total de resultados
    totalResultados.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`;
    
    // Mostrar sección de resultados
    resultadosSection.classList.add('show');
    
    // Scroll a resultados
    resultadosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function limpiarFiltros() {
    document.getElementById('formConsulta').reset();
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    
    // Ocultar resultados
    document.getElementById('resultadosSection').classList.remove('show');
}
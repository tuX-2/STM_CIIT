// js/consultar_productos.js

document.addEventListener('DOMContentLoaded', () => {
    cargarLocalidades();
    cargarTiposEmbalaje();
    cargarTiposMercancia();

    document.getElementById('formConsulta').addEventListener('submit', e => {
        e.preventDefault();
        consultarProductos();
    });

    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('btnCancelar').addEventListener('click', () => {
        window.location.href = 'panel_general.html';
    });
});

function cargarLocalidades() {
    fetch('../backend/obtener_localidades.php')
        .then(r => r.json())
        .then(data => {
            const select = document.getElementById('filtro_ubicacion');
            select.innerHTML = '';
            data.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc.id_localidad;
                opt.textContent = loc.nombre_centro_trabajo;
                select.appendChild(opt);
            });
        })
        .catch(err => console.error('Error cargando localidades:', err));
}

function cargarTiposMercancia() {
    const tipos = [
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
    const select = document.getElementById('filtro_tipo_mercancia');
    select.innerHTML = '';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
}

function cargarTiposEmbalaje() {
    const tipos = [
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
        'Embalaje especial para materiales explosivos',
        'Otro tipo (especificar)'
    ];

    const select = document.getElementById('filtro_tipo_embalaje');
    select.innerHTML = '';
    tipos.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
}


function hayFiltrosRellenos() {
    const form = document.getElementById('formConsulta');

    // Recorremos todos los inputs y selects
    for (const element of form.elements) {
        if (element.tagName === 'INPUT' && element.type === 'text' && element.value.trim() !== '') {
            return true;
        }
        if (element.tagName === 'SELECT') {
            if (element.multiple) {
                // Si es múltiple, verificar si alguna opción está seleccionada
                if ([...element.options].some(opt => opt.selected)) return true;
            } else if (element.value.trim() !== '') {
                return true;
            }
        }
    }

    return false; // Ningún filtro tiene valor
}

function consultarProductos() {
    if (!hayFiltrosRellenos()) {
        alert('Por favor, rellena o selecciona al menos un filtro para realizar la búsqueda.');
        return;
    }

    const form = document.getElementById('formConsulta');
    const formData = new FormData(form);

    // eliminar campos vacíos
    for (let [k, v] of formData.entries()) {
        if (!v.trim()) formData.delete(k);
    }

    fetch('../backend/consultar_productos.php', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
    })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(data => {
            console.log('Respuesta:', data);
            if (data.success) {
                mostrarResultados(data.productos);
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Error en la solicitud:', err);
            alert('Error al comunicarse con el servidor.');
        });
}

// Asociar la función al submit del formulario
document.getElementById('formConsulta').addEventListener('submit', function (e) {
    e.preventDefault();
    consultarProductos();
});

function mostrarResultados(productos) {
    const tbody = document.getElementById('tablaResultadosBody');
    const total = document.getElementById('totalResultados');
    const section = document.getElementById('resultadosSection');
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No se encontraron resultados.</td></tr>';
    } else {
        productos.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.nombre_producto}</td>
                <td>${p.nombre_localidad}</td>
                <td>${p.tipo_de_mercancia}</td>
                <td>${p.tipo_de_embalaje}</td>
                <td>${parseFloat(p.peso).toFixed(2)}</td>
                <td>${parseFloat(p.altura).toFixed(2)}</td>
                <td>${parseFloat(p.peso_volumetrico).toFixed(2)}</td>
                <td>${p.unidades_existencia}</td>
            `;
            tbody.appendChild(row);
        });
    }

    total.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''} encontrado${productos.length !== 1 ? 's' : ''}`;
    section.classList.add('show');
}

function limpiarFiltros() {
    document.getElementById('formConsulta').reset();
    document.getElementById('tablaResultadosBody').innerHTML = '';
    document.getElementById('totalResultados').textContent = '0 productos encontrados';
    document.getElementById('resultadosSection').classList.remove('show');
}

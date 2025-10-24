document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------
    // 1. Rellenar Select de Afiliaciones
    // -----------------------------
    const selectAfiliacion = document.getElementById('afiliacion_laboral');
    if (selectAfiliacion) {
        fetch('../backend/obtener_localidades.php')
            .then(res => {
                if (!res.ok) throw new Error('Error HTTP: ' + res.status);
                return res.json();
            })
            .then(localidades => {
                selectAfiliacion.innerHTML = '<option value="">Seleccione una localidad</option>';
                localidades.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.id_localidad;
                    option.textContent = loc.nombre_centro_trabajo;
                    selectAfiliacion.appendChild(option);
                });
            })
            .catch(err => {
                console.error('Error al cargar localidades:', err);
                selectAfiliacion.innerHTML = '<option value="">Error al cargar</option>';
            });
    }

    // -----------------------------
    // 2. Botón Cancelar del registro
    // -----------------------------
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            Swal.fire({
                title: '¿Está seguro que desea cancelar el registro?',
                text: "Se perderán los datos ingresados.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Se descartan los cambios',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                background: '#ffffff',
                color: '#000000',
                confirmButtonColor: '#000000',
                cancelButtonColor: '#444444'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'panel_general.html';
                }
            });
        });
    }

    // -----------------------------
    // 3. Funcionalidad de Consultas
    // -----------------------------
    const tablaCuerpo = document.getElementById('tabla-resultados');
    const form = document.querySelector('form');
    const inputCurp = document.getElementById('curp_personal');
    let datosIniciales = [];

    // Función para mostrar los datos en la tabla
    function mostrarTabla(datos) {
        if (!tablaCuerpo) return;
        tablaCuerpo.innerHTML = '';
        if (datos.length === 0) {
            tablaCuerpo.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay personal con esa CURP</td></tr>`;
        } else {
            datos.forEach(p => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${p.nombre_personal}</td>
                    <td>${p.apellido_paterno}</td>
                    <td>${p.apellido_materno}</td>
                    <td>${p.nombre_centro_trabajo}</td>
                    <td>${p.cargo}</td>
                    <td>${p.curp}</td>
                `;
                tablaCuerpo.appendChild(fila);
            });
        }
        document.getElementById('resultado-consulta')?.classList.add('active');
    }

    // Función para cargar datos desde backend
    function cargarDatos(curp = '') {
        const formData = new FormData();
        formData.append('curp_personal', curp);

        fetch('/backend/consultaPersonal.php', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (!curp) datosIniciales = data; // guardar la primera consulta
                mostrarTabla(data);
            })
            .catch(err => console.error('Error:', err));
    }

    // Cargar todos los registros al abrir la página
    if (tablaCuerpo && form && inputCurp) {
        cargarDatos();

        // Filtrar al enviar formulario
        form.addEventListener('submit', e => {
            e.preventDefault();
            const curp = inputCurp.value.trim();
            cargarDatos(curp);
        });

        // Filtrar dinámicamente mientras escribe (opcional)
        inputCurp.addEventListener('input', () => {
            const curp = inputCurp.value.trim();
            if (curp === '') {
                mostrarTabla(datosIniciales); // si el input está vacío, mostrar todos
            } else {
                cargarDatos(curp); // si escribe algo, filtrar por CURP
            }
        });

        // Resetear formulario
        document.querySelector('button[type="reset"]')?.addEventListener('click', () => {
            form.reset();
            mostrarTabla(datosIniciales);
        });

        // Cancelar
        document.querySelector('button[type="button"]')?.addEventListener('click', () => {
            window.location.href = 'panel_general.html';
        });
    }

});
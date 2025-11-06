// cancelar.js
function configurarBotonCancelar(botonId, urlRedireccion) {
    const botonCancelar = document.getElementById(botonId);
    if (!botonCancelar) return;

    botonCancelar.addEventListener('click', (evento) => {
        evento.preventDefault();

        const formulario = obtenerFormulario(botonCancelar);
        const datosFormulario = guardarDatosFormulario(formulario);

        mostrarAlertaConfirmacion().then((usuarioConfirmo) => {
            if (usuarioConfirmo) {
                redirigir(urlRedireccion);
            } else {
                restaurarFormulario(formulario, datosFormulario);
            }
        });
    });
}

function obtenerFormulario(boton) {
    return boton.closest('form');
}

function guardarDatosFormulario(formulario) {
    if (!formulario) return {};
    const datos = {};
    for (const elemento of formulario.elements) {
        if (elemento.name) {
            datos[elemento.name] = elemento.value;
        }
    }
    return datos;
}

function mostrarAlertaConfirmacion() {
    return Swal.fire({
        title: '¿Está seguro que desea cancelar el registro?',
        text: 'Se perderán los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar cambios',
        cancelButtonText: 'No, continuar',
        reverseButtons: true,
        background: '#ffffff',
        color: '#000000',
        confirmButtonColor: '#000000',
        cancelButtonColor: '#444444'
    }).then((resultado) => resultado.isConfirmed);
}

function redirigir(url) {
    window.location.href = url;
}

function restaurarFormulario(formulario, datos) {
    if (!formulario) return;
    for (const [nombre, valor] of Object.entries(datos)) {
        const campo = formulario.elements[nombre];
        if (campo) campo.value = valor;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    configurarBotonCancelar('btnCancelar', 'panel_general.html');
});

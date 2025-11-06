document.addEventListener('DOMContentLoaded', () => {
    const formRegistrar = document.getElementById('formRegistrarLocalidades');

    if (!formRegistrar) return;

    formRegistrar.addEventListener('submit', e => {
        e.preventDefault();

        fetch('/backend/registroLocalidades.php', {
            method: 'POST',
            body: new FormData(formRegistrar)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: data.message,
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                    formRegistrar.reset();
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'error',
                        title: data.error || 'Error al registrar',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                }
            })
            .catch(() => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error al conectar con el servidor',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            });
    });

    // Botón cancelar
    configurarBotonCancelar('btnCancelar', 'panel_general.html');
});

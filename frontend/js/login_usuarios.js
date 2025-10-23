// Funcionalidad del login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre_usuario = document.getElementById('nombre_usuario').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const btnLogin = document.querySelector('.btn-login');
    
    // Mostrar loading
    btnLogin.classList.add('loading');
    btnLogin.disabled = true;
    
    try {
        const response = await fetch('../backend/consultaLogin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_usuario: nombre_usuario,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
        if (data.success) {
    localStorage.setItem('usuario', JSON.stringify(data.data));
    window.location.href = 'panel_general.html';
}
        } else {
            alert('Error: ' + data.message);
            btnLogin.classList.remove('loading');
            btnLogin.disabled = false;
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
    }
});
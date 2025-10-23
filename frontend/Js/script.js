//Funcionalidad del login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    //Autenticación
    console.log('Email:', email);
    console.log('Password:', password);
    
    //login exitoso
    alert('¡Login exitoso!\nEmail: ' + email);
    
    // Limpiar el formulario
    this.reset();
});
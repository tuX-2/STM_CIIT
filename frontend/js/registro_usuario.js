const form = document.getElementById('registerForm');
const username = document.getElementById('username');
const email = document.getElementById('email');
const personalId = document.getElementById('personalId');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const successMessage = document.getElementById('successMessage');

function showError(input, message) {
    const errorDiv = document.getElementById(input.id + 'Error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    input.classList.add('error');
}

function clearError(input) {
    const errorDiv = document.getElementById(input.id + 'Error');
    errorDiv.classList.remove('show');
    input.classList.remove('error');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(name) {
    // Verificar que solo contenga letras y espacios
    const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]*$/;
    return nameRegex.test(name);
}

function validatePassword(pass) {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial
    const minLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar
    };
}

function validateForm() {
    let isValid = true;

    // Limpiar errores previos
    [username, email, personalId, password, confirmPassword].forEach(clearError);

    // Validar nombre de usuario
    if (username.value.trim() === '') {
        showError(username, 'El nombre de usuario es requerido');
        isValid = false;
    } else if (!validateUsername(username.value.trim())) {
        showError(username, 'El nombre debe contener solo letras y comenzar con mayúscula');
        isValid = false;
    } else if (username.value.length < 4) {
        showError(username, 'El nombre de usuario debe tener al menos 4 caracteres');
        isValid = false;
    }

    // Validar email
    if (email.value.trim() === '') {
        showError(email, 'El correo electrónico es requerido');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, 'Ingrese un correo electrónico válido');
        isValid = false;
    }

    // Validar clave de identificación
    if (personalId.value.trim() === '') {
        showError(personalId, 'La clave de identificación es requerida');
        isValid = false;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password.value);
    if (password.value === '') {
        showError(password, 'La contraseña es requerida');
        isValid = false;
    } else if (!passwordValidation.isValid) {
        let errorMsg = 'La contraseña debe contener: ';
        let requirements = [];
        if (!passwordValidation.minLength) requirements.push('8 caracteres');
        if (!passwordValidation.hasUpperCase) requirements.push('mayúscula');
        if (!passwordValidation.hasLowerCase) requirements.push('minúscula');
        if (!passwordValidation.hasNumber) requirements.push('número');
        if (!passwordValidation.hasSpecialChar) requirements.push('símbolo especial');
        errorMsg += requirements.join(', ');
        showError(password, errorMsg);
        isValid = false;
    }

    // Validar confirmación de contraseña
    if (confirmPassword.value === '') {
        showError(confirmPassword, 'Debe confirmar la contraseña');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Las contraseñas no coinciden');
        isValid = false;
    }

    return isValid;
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // evita el envío tradicional

    const formData = new FormData();
    formData.append("nombre_usuario", document.getElementById("username").value);
    formData.append("correo", document.getElementById("email").value);
    formData.append("clave_personal", document.getElementById("personalId").value);
    formData.append("contrasena", document.getElementById("password").value);
    formData.append("confirmar_contrasena", document.getElementById("confirmPassword").value);

    try {

        const response = await fetch("/../backend/registrar_usuario.php", {
            method: "POST",
            body: formData,
        });

        const text = await response.text();

        const messageBox = document.getElementById("successMessage");
        messageBox.style.backgroundColor = (text === "Usuario registrado exitosamente.") ? "#4caf50" : "#f32b2bff";
        // Mostrar mensaje en pantalla
        messageBox.style.display = "block";
        messageBox.innerText = (text === "Usuario registrado exitosamente.") ? text + " Por favor vuelva a iniciar sesión como usuario." : text;

        // Regresar a la vista de Login si se hizo correctamente el registro del usuario.
        if (text === "Usuario registrado exitosamente.") {
            setTimeout(function () {
            window.location.href = "/../index.html";
        }, 2000);
        }

    } catch (error) {
        console.error("Error:", error);
    }
});


// Limpiar errores al escribir
[username, email, personalId, password, confirmPassword].forEach(input => {
    input.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            clearError(this);
        }
    });
});
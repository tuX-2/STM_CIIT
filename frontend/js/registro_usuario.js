const form = document.getElementById('registerForm');
const inputs = {
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    personalId: document.getElementById('personalId'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
};
const successMessage = document.getElementById('successMessage');

// ---------- Funciones auxiliares ----------
const showError = (input, message) => {
    const errorDiv = document.getElementById(input.id + 'Error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    input.classList.add('error');
};

const clearError = input => {
    const errorDiv = document.getElementById(input.id + 'Error');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
    input.classList.remove('error');
};

const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validateUsername = name => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{0,98}$/.test(name);

const validatePassword = pass => ({
    minLength: pass.length >= 8,
    hasUpperCase: /[A-Z]/.test(pass),
    hasLowerCase: /[a-z]/.test(pass),
    hasNumber: /[0-9]/.test(pass),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
});

// ---------- Validaciones individuales ----------
function checkUsername() {
    const val = inputs.username.value.trim();
    clearError(inputs.username);
    if (!val) return showError(inputs.username, 'El nombre de usuario es requerido');
    if (!validateUsername(val)) return showError(inputs.username, 'Debe iniciar con mayúscula, solo letras y sin espacios');
    if (val.length < 4) return showError(inputs.username, 'Debe tener al menos 4 caracteres');
    if (val.length > 100) return showError(inputs.username, 'El nombre de usuario no debe de exceder 100 caracteres');
}

function checkEmail() {
    const val = inputs.email.value.trim();
    clearError(inputs.email);
    if (!val) return showError(inputs.email, 'El correo electrónico es requerido');
    if (val.length > 150) return showError(inputs.username, 'El correo no debe de exceder 150 caracteres');
    if (!validateEmail(val)) return showError(inputs.email, 'Ingrese un correo electrónico válido');
}

function checkPersonalId() {
    const val = inputs.personalId.value.trim();
    clearError(inputs.personalId);
    if (!val) return showError(inputs.personalId, 'La clave de identificación es requerida');
}

function checkPassword() {
    const val = inputs.password.value;
    clearError(inputs.password);
    if (val.length > 100) return showError(inputs.username, 'La contraseña no debe de exceder 100 caracteres');
    if (!val) return showError(inputs.password, 'La contraseña es requerida');

    const p = validatePassword(val);
    const requirements = [];
    if (!p.minLength) requirements.push('8 caracteres');
    if (!p.hasUpperCase) requirements.push('mayúscula');
    if (!p.hasLowerCase) requirements.push('minúscula');
    if (!p.hasNumber) requirements.push('número');
    if (!p.hasSpecialChar) requirements.push('símbolo especial');

    if (requirements.length)
        showError(inputs.password, 'Debe contener: ' + requirements.join(', '));
}

function checkConfirmPassword() {
    clearError(inputs.confirmPassword);
    if (!inputs.confirmPassword.value)
        return showError(inputs.confirmPassword, 'Debe confirmar la contraseña');
    if (inputs.confirmPassword.value !== inputs.password.value)
        return showError(inputs.confirmPassword, 'Las contraseñas no coinciden');
}

// ---------- Validación global ----------
function validateForm() {
    checkUsername();
    checkEmail();
    checkPersonalId();
    checkPassword();
    checkConfirmPassword();

    return !document.querySelector('.error'); // true si no hay errores
}

// ---------- Validaciones en tiempo real ----------
const handlers = {
    username: checkUsername,
    email: checkEmail,
    personalId: checkPersonalId,
    password: checkPassword,
    confirmPassword: checkConfirmPassword
};

Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('input', handlers[key]);
});

// ---------- Envío del formulario ----------
form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(form);

    try {
        const response = await fetch('/../backend/registrar_usuario.php', {
            method: 'POST',
            body: formData
        });
        const text = await response.text();
        const success = text === 'Usuario registrado exitosamente.';

        successMessage.style.backgroundColor = success ? '#4caf50' : '#f32b2bff';
        successMessage.style.display = 'block';
        successMessage.textContent = success
            ? text + ' Por favor vuelva a iniciar sesión como usuario.'
            : text;

        if (success) setTimeout(() => (window.location.href = '/../index.html'), 2000);
    } catch (err) {
        console.error('Error:', err);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const tbody = document.querySelector("tbody");
    const resetButton = form.querySelector('button[type="reset"]');

    // 🔹 Función para renderizar la tabla
    function renderTable(data) {
        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4">No se encontraron usuarios.</td></tr>`;
            return;
        }

        data.forEach(u => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${u.nombre_usuario}</td>
                <td>${u.nombre_completo}</td>
                <td>${u.correo}</td>
                <td>${u.clave_identificacion}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // 🔹 Función para consultar usuarios
    function consultarUsuarios(clave = "") {
        const formData = new FormData();
        if (clave) formData.append("clave_usuario", clave);
        tbody.innerHTML = `<tr><td colspan="4">Cargando usuarios...</td></tr>`;

        fetch("/../backend/consultar_usuario.php", {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderTable(data.data);
                } else {
                    tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
                }
            })
            .catch(err => {
                console.error("Error al consultar:", err);
                tbody.innerHTML = `<tr><td colspan="4">Error al cargar los datos.</td></tr>`;
            });
    }

    // 🔹 Al enviar el formulario (buscar por clave)
    form.addEventListener("submit", e => {
        e.preventDefault();
        const clave = document.getElementById("clave_usuario").value.trim();
        consultarUsuarios(clave);
    });

    // 🔹 Al limpiar → mostrar todos los usuarios otra vez
    resetButton.addEventListener("click", e => {
        setTimeout(() => consultarUsuarios(), 100); // pequeño delay para limpiar el campo
    });

    // 🔹 Mostrar todos al cargar la página
    consultarUsuarios();
});

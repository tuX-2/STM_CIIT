document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const tbody = document.querySelector("tbody");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const clave = formData.get("clave_usuario").trim();

        if (!clave) {
            alert("Por favor ingresa una clave de usuario.");
            return;
        }

        try {
            const response = await fetch("/../backend/pruebas/consultar_usuario.php", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            tbody.innerHTML = "";

            if (data.success && data.data.length > 0) {
                data.data.forEach((usuario) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
            <td>${usuario.nombre_usuario}</td>
            <td>${usuario.nombre_completo}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.clave_identificacion}</td>
          `;
                    tbody.appendChild(tr);
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="4" style="text-align:center;color:red;">${data.message}</td>`;
                tbody.appendChild(tr);
            }
        } catch (error) {
            console.error("Error al consultar:", error);
            tbody.innerHTML = `<tr><td colspan="4" style="color:red;text-align:center;">Error al conectar con el servidor</td></tr>`;
        }
    });
});

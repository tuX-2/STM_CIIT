# 🧩 Sistema de Gestión de Usuarios

Este proyecto tiene como objetivo desarrollar un **Sistema de Gestión de Usuarios** que permita **administrar eficientemente** la información de los usuarios de la plataforma **CIIT**.

El sistema busca garantizar la **seguridad**, **integridad** y **facilidad de uso** en cada una de sus operaciones, ofreciendo una experiencia confiable tanto para administradores como para usuarios finales.

---

## 🚧 Estado del proyecto
📌 *Proyecto en desarrollo — versión inicial.*

---

## 🐳 Ejecución con Docker

Para probar el proyecto es necesario tener instalado **[Docker](https://www.docker.com/)** y **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

### 🔹 Iniciar los contenedores

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d
```

Este comando levantará los servicios definidos en el archivo `docker-compose.yml`.

> 💡 **Nota:** Asegúrate de que Docker Desktop esté en ejecución antes de ejecutar el comando.

---

## 🧪 Carga de datos de prueba

Antes de realizar pruebas, debes insertar los datos de ejemplo en la base de datos.  
Abre tu navegador y accede a la siguiente URL:

🔗 [http://localhost:8081/backend/pruebas/insert.php](http://localhost:8081/backend/pruebas/insert.php)

Esto agregará los registros iniciales necesarios para el funcionamiento del sistema.

> ⚠️ **Importante:** Ejecuta esta URL solo una vez para evitar duplicar los datos.

---

## 🔍 Consultar información de prueba

Para verificar los datos insertados, visita la siguiente URL:

🔗 [http://localhost:8081/backend/pruebas/read.php](http://localhost:8081/backend/pruebas/read.php)

Aquí podrás visualizar la información cargada y confirmar el correcto funcionamiento de la conexión con la base de datos.


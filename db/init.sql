CREATE TABLE localidades (
    id_localidad SERIAL PRIMARY KEY,
    nombre_centro_trabajo VARCHAR(100),
    ubicacion_georeferenciada VARCHAR(200),
    poblacion VARCHAR(100),
    localidad VARCHAR(100),
    estado VARCHAR(100),
    tipo_instalacion VARCHAR(50) CHECK (tipo_instalacion IN 
        ('Centro Productivo', 'Centro de Distribucion', 'PODEBI', 'Almacen'))
);

CREATE TABLE personal (
    id_personal SERIAL PRIMARY KEY,
    nombre_personal VARCHAR(100),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    afiliacion_laboral INT REFERENCES localidades(id_localidad) ON DELETE CASCADE,
    cargo VARCHAR(50) CHECK (cargo IN 
        ('Autoridad', 'Administrador del TMS', 'Operador Logístico','Cliente' ,'Jefe de Almacén')),
    curp VARCHAR(18)
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100),
    contrasena VARCHAR(100),
    correo_electronico VARCHAR(150),
    identificador_de_rh INT REFERENCES personal(id_personal) ON DELETE CASCADE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(100),
    ubicacion_producto INT REFERENCES localidades(id_localidad),
    peso FLOAT,
    altura FLOAT,
    cajas_por_cama INT,
    camas_por_pallet INT,
    peso_soportado FLOAT,
    peso_volumetrico FLOAT,
    unidades_existencia FLOAT,
    tipo_de_embalaje VARCHAR(100),
    tipo_de_mercancia VARCHAR(100)
);

CREATE TABLE contenedores (
    id_contenedor SERIAL PRIMARY KEY,
    etiqueta VARCHAR(50),
    largo FLOAT,
    ancho FLOAT,
    altura FLOAT
);

CREATE TABLE transacciones_productos (
    id_transaccion SERIAL PRIMARY KEY,
    numero_transaccion VARCHAR(50),
    localidad INT REFERENCES localidades(id_localidad),
    tipo_transaccion VARCHAR(50),
    fecha_inicio_transaccion DATE,
    fecha_finalizacion_transaccion DATE
);

CREATE TABLE vehiculos (
    id_vehiculo SERIAL PRIMARY KEY,
    modalidad_vehiculo VARCHAR(100),
    descripcion_vehiculo VARCHAR(100),
    chofer_asignado INT REFERENCES personal(id_personal)
);

CREATE TABLE carrocerias (
    id_carroceria SERIAL PRIMARY KEY,
    matricula VARCHAR(50),
    id_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    localidad_pertenece INT REFERENCES localidades(id_localidad),
    responsable_carroceria INT REFERENCES personal(id_personal),
    numero_contenedores INT,
    peso_vehicular FLOAT,
    numero_ejes_vehiculares INT
);

CREATE TABLE vehiculos_carrocerias (
    id_vehiculo_carroceria SERIAL PRIMARY KEY,
    id_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    id_carroceria INT REFERENCES carrocerias(id_carroceria)
);


CREATE TABLE carrocerias_detalle (
    id_carrocerias_detalle SERIAL PRIMARY KEY,
    identificador_carroceria INT REFERENCES carrocerias(id_carroceria),
    numero_contenedor INT,
    capacidad_contenedor FLOAT
);

CREATE TABLE maniobras (
    id_maniobra SERIAL PRIMARY KEY,
    id_carroceria INT REFERENCES carrocerias(id_carroceria),
    localidad INT REFERENCES localidades(id_localidad),
    tiempo_carga INT,
    tiempo_descarga INT,
    tiempo_almacenaje INT
);

CREATE TABLE mantenimientos_vehiculos (
    id_mantenimiento SERIAL PRIMARY KEY,
    id_transporte INT REFERENCES vehiculos(id_vehiculo),
    fecha_ingreso DATE,
    fecha_salida DATE,
    descripcion_servicios VARCHAR(200)
);

CREATE TABLE rutas (
    id_ruta SERIAL PRIMARY KEY,
    localidad_origen INT REFERENCES localidades(id_localidad),
    localidad_destino INT REFERENCES localidades(id_localidad),
    tipo_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    tipo_ruta INT REFERENCES carrocerias(id_carroceria),
    distancia FLOAT,
    descripcion VARCHAR(200)
);

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    localidad_origen INT REFERENCES localidades(id_localidad),
    localidad_destino INT REFERENCES localidades(id_localidad),
    estatus_pedido VARCHAR(50)
);

CREATE TABLE pedidos_detalles (
    id_pedido_detalles SERIAL PRIMARY KEY,
    id_pedido INT REFERENCES pedidos(id_pedido),
    identificador_producto INT REFERENCES productos(id_producto),
    cantidad_producto INT,
    observaciones VARCHAR(200)
);

CREATE TABLE fleteros (
    id_fletero SERIAL PRIMARY KEY,
    localidad_origen INT REFERENCES localidades(id_localidad),
    localidad_destino INT REFERENCES localidades(id_localidad),
    identificador_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    fecha_y_hora_llegada TIMESTAMP,
    fecha_y_hora_salida TIMESTAMP
);

CREATE TABLE fleteros_detalle (
    id_fletero_detalle SERIAL PRIMARY KEY,
    identificador_flete INT REFERENCES fleteros(id_fletero),
    identificador_producto INT REFERENCES productos(id_producto),
    numero_unidades INT,
    numero_contenedor INT,
    observaciones VARCHAR(200)
);

CREATE TABLE envios (
    id_envio SERIAL PRIMARY KEY,
    identificador_flete INT REFERENCES fleteros(id_fletero),
    identificador_pedido INT REFERENCES pedidos(id_pedido),
    punto_verificacion INT REFERENCES localidades(id_localidad),
    personal_asignado INT REFERENCES personal(id_personal),
    personal_verifica INT REFERENCES personal(id_personal),
    fecha_verificacion DATE,
    geolocalizacion VARCHAR(200)
);
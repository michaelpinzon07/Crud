Create database crud_development;
create database crud_test;
create database login;

use login;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    password VARCHAR(255)
);

CREATE TABLE localizaciones (
	id INT auto_increment unique,
    localizacion varchar(50),
    activo bool
);
CREATE TABLE campos(
 id INT auto_increment unique,
 cargo varchar(50),
 activo bool
);

ALTER TABLE localizaciones
ADD PRIMARY KEY (id);

ALTER TABLE campos
ADD PRIMARY KEY (id);


CREATE TABLE empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    identificacion BIGINT NOT NULL UNIQUE,
    localizacion_id INT NOT NULL,
    cargo_id INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (localizacion_id) REFERENCES localizaciones(id),
    FOREIGN KEY (cargo_id) REFERENCES campos(id)
);

INSERT INTO empleados (
    nombres, 
    apellidos, 
    identificacion, 
    localizacion_id, 
    cargo_id, 
    active
) VALUES (
    'Juan',             -- nombres
    'Pérez',            -- apellidos
    1234567890,         -- identificacion (debe ser único y no nulo)
    10,                  -- localizacion_id (asume que '1' existe en localizaciones)
    2,                  -- cargo_id (asume que '2' existe en campos)
    TRUE                -- active (opcional, por defecto es TRUE)
);

SELECT 
    e.nombres,
    e.apellidos,
    e.identificacion,
    l.localizacion,
    c.cargo,
    e.active
FROM 
    empleados e
JOIN 
    localizaciones l ON e.localizacion_id = l.id
JOIN 
    campos c ON e.cargo_id = c.id;





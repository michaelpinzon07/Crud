
// se importa express y se crea una instancia de la aplicacion
const express = require("express");
const app = express();



app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });

app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

app.set("view engine", "ejs");

const bcryptjs = require('bcryptjs');
const session = require('express-session');
const conection = require("./database/db.js");

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));



// Rutas

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/cruds",isAuthenticated, (req, res) => {
    res.render("cruds");
});



// autenticar usuario
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Cerrar sesión
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            
        } else {
            res.redirect('/');
        }
    });
});





// LOGIN Y REGISTRO DE USUARIOS


// Autenticar usuario
app.post("/auth", async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;

    if (user && password) {
        conection.query("SELECT * FROM usuarios WHERE user = ?", [user], async (error, results) => {
            if (results.length === 0 || !(await bcryptjs.compare(password, results[0].password))) {
                res.render("login", {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Incorrect user or password",
                    alertIcon: "error",
                    showconfirmButton: true,
                    timer: false,
                    ruta: "login"
                });
            } else {
                // Guardar el usuario en la sesión
                req.session.user = results[0];
                
                res.render("login", {
                    alert: true,
                    alertTitle: "Conexion exitosa",
                    alertMessage: "Login correcto!",
                    alertIcon: "success",
                    showconfirmButton: false,
                    timer: 1500,
                    ruta: "cruds"
                });
            }
        });
    } 
});


//registrar usuario
app.post("/register", async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;
    let passwordHash = await bcryptjs.hash(password, 8);
    conection.query("INSERT INTO usuarios SET ?", { user: user, password: passwordHash }, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render("register", {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "Registration successful",
                alertIcon: "success",
                showconfirmButton: false,
                timer: 1500,
                ruta: ""
            });
        }
    });
});





// CRUD ------ LOCALIZACIONES


//mostar localizaciones
app.get("/crud_localizaciones",isAuthenticated, (req, res) => {
    conection.query("SELECT * FROM localizaciones", (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.render("crud_localizaciones", {
                localizaciones: [] // Pasar un array vacío en caso de error
            });
        } else {
            
            res.render("crud_localizaciones", {
                
                localizaciones: results // Pasar los resultados de la consulta
            });
        }
    });
});

// Eliminar localizaciones 
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;

    // Eliminar la localización con el id proporcionado
    conection.query("DELETE FROM localizaciones WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al eliminar el registro:", error);
            res.redirect("/crud_localizaciones"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_localizaciones"); // Redirigir después de eliminar
        }
    });
});


// Actualizar localizaciones
app.post("/update/:id", (req, res) => {
    const id = req.params.id;
    const { localizacion, activo } = req.body;

    // Actualizar la localización con el id proporcionado
    conection.query("UPDATE localizaciones SET localizacion = ?, activo = ? WHERE id = ?", [localizacion, activo ? 1 : 0, id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el registro:", error);
            res.redirect("/crud_localizaciones"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_localizaciones"); // Redirigir después de actualizar
        }
    });
});

// Editar localizaciones
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;

    // Consultar la base de datos para obtener la localización con el id proporcionado
    conection.query("SELECT * FROM localizaciones WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.redirect("/crud_localizaciones"); // Redirigir en caso de error
        } else if (results.length === 0) {
            res.redirect("/crud_localizaciones"); // Redirigir si no se encuentra la localización
        } else {
            res.render("edit_localizaciones", {
                localizacion: results[0] // Pasar el resultado al formulario de edición
            });
        }
    });
});


// Insertar localizaciones (POST)
app.post("/crud_localizaciones", (req, res) => {
    const localizacion = req.body.localizacion;
    const activo = req.body.activo ? 1 : 0; // Asegúrate de que activo es un entero

    conection.query("INSERT INTO localizaciones (localizacion, activo) VALUES (?, ?)", [localizacion, activo], (error) => {
        if (error) {
            console.error("Error al insertar datos:", error);
        }
        // Redirigir a la misma página después de insertar
        res.redirect("/crud_localizaciones");
    });
});




// CRUD ------ CARGOS



//mostrar cargos    
app.get("/crud_cargos",isAuthenticated, (req, res) => {
    conection.query("SELECT * FROM campos", (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.render("crud_cargos", {
                cargos: [] // Pasar un array vacío en caso de error
            });
        } else {
            
            res.render("crud_cargos", {
                
                cargos: results // Pasar los resultados de la consulta
            });
        }
    });
});

// Insertar cargos (POST)
app.post("/crud_cargos", (req, res) => {
    const cargo = req.body.cargo;
    const activo = req.body.activo ? 1 : 0; // Asegúrate de que activo es un entero

    conection.query("INSERT INTO campos (cargo, activo) VALUES (?, ?)", [cargo, activo], (error) => {
        if (error) {
            console.error("Error al insertar datos:", error);
        }
        // Redirigir a la misma página después de insertar
        res.redirect("/crud_cargos");
    });
});

// Eliminar cargos
app.get("/deletecargos/:id", (req, res) => {
    const id = req.params.id;

    // Eliminar la localización con el id proporcionado
    conection.query("DELETE FROM campos WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al eliminar el registro:", error);
            res.redirect("/crud_cargos"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_cargos"); // Redirigir después de eliminar
        }
    });
});


// Editar cargos
app.get("/editcargos/:id", (req, res) => {
    const id = req.params.id;

    // Consultar la base de datos para obtener la localización con el id proporcionado
    conection.query("SELECT * FROM campos WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.redirect("/crud_cargos"); // Redirigir en caso de error
        } else if (results.length === 0) {
            res.redirect("/crud_cargos"); // Redirigir si no se encuentra la localización
        } else {
            res.render("edit_cargos", {
                cargos: results[0] // Pasar el resultado al formulario de edición
            });
        }
    });
});

// Actualizar cargos
app.post("/updatecargo/:id", (req, res) => {
    const id = req.params.id;
    const { cargo, activo } = req.body;

    // Actualizar la localización con el id proporcionado
    conection.query("UPDATE campos SET cargo = ?, activo = ? WHERE id = ?", [cargo, activo ? 1 : 0, id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el registro:", error);
            res.redirect("/crud_cargos"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_cargos"); // Redirigir después de actualizar
        }
    });
});



// CRUD ------ EMPLEADOS


//mostrar empleados

app.get("/crud_empleados",isAuthenticated, (req, res) => {
    conection.query("SELECT * FROM empleados", (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.render("crud_empleados", {
                empleados: [] // Pasar un array vacío en caso de error
            });
        } else {
            
            res.render("crud_empleados", {
                
                empleados: results // Pasar los resultados de la consulta
            });
        }
    });
});

// Insertar empleados (POST)

app.post("/crud_empleados", (req, res) => {
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const identificacion = req.body.identificacion;
    const localizacion_id = req.body.localizacion_id;
    const cargo_id = req.body.cargo_id 
    const active = req.body.active ? 1 : 0; // Asegúrate de que activo es un entero

    conection.query("INSERT INTO empleados (nombres, apellidos, identificacion, localizacion_id, cargo_id,active) VALUES (?, ?, ?, ?, ?,?)", [nombres, apellidos, identificacion, localizacion_id, cargo_id,active], (error) => {
        if (error) {
            console.error("Error al insertar datos:", error);
        }
        // Redirigir a la misma página después de insertar
        res.redirect("/crud_empleados");
    });
});

// Eliminar empleados

app.get("/deleteempleados/:id", (req, res) => {
    const id = req.params.id;

    // Eliminar la localización con el id proporcionado
    conection.query("DELETE FROM empleados WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al eliminar el registro:", error);
            res.redirect("/crud_empleados"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_empleados"); // Redirigir después de eliminar
        }
    });
});



// Editar empleados

app.get("/editempleados/:id", (req, res) => {
    const id = req.params.id;

    // Consultar la base de datos para obtener la localización con el id proporcionado
    conection.query("SELECT * FROM empleados WHERE id = ?", [id], (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.redirect("/crud_empleados"); // Redirigir en caso de error
        } else if (results.length === 0) {
            res.redirect("/crud_empleados"); // Redirigir si no se encuentra la localización
        } else {
            res.render("edit_empleados", {
                empleados: results[0] // Pasar el resultado al formulario de edición
            });
        }
    });
});


// Actualizar empleados

app.post("/updateempleados/:id", (req, res) => {

    const id = req.params.id;
    const { nombres, apellidos, identificacion, localizacion_id, cargo_id } = req.body;

    // Actualizar la localización con el id proporcionado
    conection.query("UPDATE empleados SET nombres = ?, apellidos = ?, identificacion = ?, localizacion_id = ?, cargo_id = ? WHERE id = ?", [nombres, apellidos, identificacion, localizacion_id, cargo_id, id], (error, results) => {
        if (error) {
            console.error("Error al actualizar el registro:", error);
            res.redirect("/crud_empleados"); // Redirigir en caso de error
        } else {
            res.redirect("/crud_empleados"); // Redirigir después de actualizar
        }
    });
});



// CRUD ------ LISTADO

app.get("/crud_listado",isAuthenticated, (req, res) => {

    const sql = `
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
    `;

    conection.query(sql, (error, results) => {
        if (error) {
            console.error("Error al consultar la base de datos:", error);
            res.render("crud_listado", {
                listados: [] // Pasar un array vacío en caso de error
            });
        } else {
            
            res.render("crud_listado", {
                
                listados: results // Pasar los resultados de la consulta
            });
        }
    });
});



//puerto
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
const mysql = require('mysql');
const conection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

conection.connect((error) => {
    if (error) {
        console.log(error);
        return;
    }
    console.log("Connection to the database was successful");
});


module.exports = conection;
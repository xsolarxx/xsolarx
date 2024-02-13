const express = require("express");
const dotenv = require("dotenv");
const { connect } = require("./src/utils/db");
const files = require("./src/middleware/files.middleware");

// Creamos el servidor web
const app = express();
// Vamos a configurar dotenv para poder utilizar las variables de entorno del .env
dotenv.config();
// Creamos la conexión con la BD (base de datos)
connect();
// Configura Cloudinary para la gestión de Img.
files.configCloudinary();

const PORT = process.env.PORT;

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

const cors = require("cors");
app.use(cors());

//! ------------------ limitaciones de cantidad en el back end
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: false }));

//! -----------------> RUTAS
const UserRoutes = require("./src/api/routes/User.routes");
app.use("/api/v1/users/", UserRoutes);
const CommentRoutes = require("./src/api/routes/Comment.routes");
app.use("/api/v1/comment/", CommentRoutes);

const ForumRoutes = require("./src/api/routes/Forum.routes");
app.use("/api/v1/forum/", ForumRoutes);

app.use("*", (req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  return next(error);
});

//! ------------------> cuando el servidor crachea metemos un 500 ----------
app.use((error, req, res) => {
  return res
    .status(error.status || 500)
    .json(error.message || "unexpected error");
});

//! ------------------ ESCUCHAMOS EN EL PUERTO EL SERVIDOR WEB-----

// esto de aqui  nos revela con que tecnologia esta hecho nuestro back
app.disable("x-powered-by");
app.listen(PORT, () =>
  console.log(`Server listening on port 👌🔍 http://localhost:${PORT}`)
);

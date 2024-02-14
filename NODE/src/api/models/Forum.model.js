const mongoose = require("mongoose");
const multer = require("multer");

// Configuración de multer para manejar la carga de imágenes
const storage = multer.memoryStorage(); // Almacenamiento en memoria para este ejemplo
const upload = multer({ storage: storage });

// Esquema para los posts
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // Representación URL
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true } //! todos los timestamps así(comment.model corregido yA)
);

// Modelo del forum que agrupa preguntas
const Forum = mongoose.model("Forum", PostSchema);

// Exportar el modelo para su uso en otros archivos
module.exports = Forum;

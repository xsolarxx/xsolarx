const mongoose = require("mongoose");
const multer = require("multer");

// Configuración de multer para manejar la carga de imágenes
const storage = multer.memoryStorage(); // Almacenamiento en memoria para este ejemplo
const upload = multer({ storage: storage });

// Esquema para los posts
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: string, // Representación URL
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

  likes: {
    type: Number,
    default: 0,
  },
});

// Modelo del forum que agrupa preguntas
const Forum = mongoose.model("Forum", PostSchemaSchema);

// Middleware para manejar la carga de imágenes en las preguntas
PostSchema.pre("save", upload.single("image"), function (next) {
  if (this.isModified("image")) {
    // Convierte la imagen cargada a un buffer y la almacena en el modelo
    this.image = this.file.buffer;
  }
  next();
});

// Exportar el modelo para su uso en otros archivos
module.exports = Forum;

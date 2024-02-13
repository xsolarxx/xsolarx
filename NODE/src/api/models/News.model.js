//Se requiere mongoose y nos traemos el esquema de datos

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  shortContent: {
    required: true,
  },
  fullContent: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
      enum: ["Paneles solares", "Energía eólica", "otros"],
      required: true,
    },
  ], //array para poner la noticia en 1 o más tags diferentes de enum.
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //tiene que tener el mismo nombre que el model para poder popular
    }, //array de los users que le han dado a "like" gracias a la populación del esquema de mongoose del User.model
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }, //array de los comentarios hechos por los users del Comment.model, según su ObjectId.
  ],
  timestamps: true,
});

// Create Company model
const News = mongoose.model("News", NewsSchema);

module.exports = News;

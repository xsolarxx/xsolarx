//Se requiere mongoose(para interactuar con la base de datos de mongodb) y el esquema de datos

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//------------------------------------------------------------------------------------------------------
const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    shortContent: {
      type: String,
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
        enum: ["Solar panels", "Wind power", "Others"],
        required: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tiene que tener el mismo nombre que el model para poder popular
      }, //array de los users que le han dado a "like" gracias a la populación del esquema de mongoose del User.model
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      }, // Array de los comentarios hechos por los users del Comment.model, según su ObjectId.
    ],
    ownerAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const News = mongoose.model("News", NewsSchema);

//---------------------------------------------------------------------------------------------------------------------
module.exports = News;

//Ok
//*Tenemos qu recoger los ids de las noticias y recoger los c

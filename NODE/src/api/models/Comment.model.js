//Se requiere mongoose(para interactuar con la base de datos de mongodb) y el esquema de datos

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//----------------------------------------------------------------------------------------------------
const CommentSchema = new Schema(
  {
    title: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId, // Referencia de user --> Se pone id en Insomnia
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    recipientNews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
    },
    recipientForum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
    },
    recipientCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

//-------------------Exportación del modelo para su uso en otros archivos------------------------------------
module.exports = Comment;

//Ok

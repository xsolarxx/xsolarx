const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//------------------------ Esquema para los posts--------------------------------------------------------------
const PostSchema = new Schema(
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
  { timestamps: true }
);

const Forum = mongoose.model("Forum", PostSchema);

//----------------Exportación del modelo para su uso en otros archivos------------------------------------
module.exports = Forum;

//Ok

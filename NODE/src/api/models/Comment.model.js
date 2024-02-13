const mongoose = require("mongoose"); // para interactuar con la base de datos de mongodb
const Schema = mongoose.Schema; //

const CommentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
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
  tags: [String],
  recipientForum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Forum",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  timestamps: true,
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;

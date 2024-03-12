const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    userOne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userTwo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      required: false,
      default: [],
    },
  },

  {
    timestamps: true,
  }
);

// we create the data schema model for mongoose
const Chat = mongoose.model("Chat", CommentSchema);
module.exports = Chat;

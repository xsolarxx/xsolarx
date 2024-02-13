const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// deletar comentario
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params; //
    const CommentDelete = await Comment.findById(id);

    await Comment.findByIdAndDelete(id);
    if (await Comment.findById(id)) {
      return res.status(404).json("Not deleted");
    } else {
      deleteImgCloudinary(image);
      return res.status(200).json("Ok deleted");
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { deleteComment };

const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// deletar comentario
const createComment = async (req, res, next) => {
  try {
    await Comment.syncIndexes();

    /** hacemos una instancia del modelo  */
    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.body?.owner,
    };
    const newComment = new Comment(customBody);
    const savedComment = await newComment.save();

    // test en el runtime
    return res
      .status(savedComment ? 200 : 404)
      .json(savedComment ? savedComment : "error al crear el comentario");
  } catch (error) {
    return res.status(404).json({
      error: "error catch create comentario",
      message: error.message,
    });
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (comment) {
      // lo buscamos para vr si sigue existiendo o no
      const finByIdComment = await Comment.findById(id);

      try {
        const test = await Comment.updateMany(
          { comment: id },
          { $pull: { comment: id } }
        );
        console.log(test);

        try {
          await User.updateMany(
            { commentFav: id },
            { $pull: { commentFav: id } }
          );

          return res.status(finByIdComment ? 404 : 200).json({
            deleteTest: finByIdComment ? false : true,
          });
        } catch (error) {
          return res.status(404).json({
            error: "error catch update User",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "error catch update Movie",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
const getAll = async (req, res, next) => {
  try {
    const allComment = await Comment.find()
    /** el find nos devuelve un array */
    if (allComment.length > 0) {
      return res.status(200).json(allComment);
    } else {
      return res.status(404).json("no se han encontrado characters");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};



module.exports = { deleteComment,createComment,getAll};

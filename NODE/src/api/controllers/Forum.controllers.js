const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR POST/FORUM-------------------------------------------------
//-------------------------------------------------------------------------------------------------
const createForum = async (req, res, next) => {
  try {
    await Forum.syncIndexes();

    /** hacemos una instancia del modelo  */
    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.body?.owner,
    };
    const newForum = new Forum(customBody);
    const savedForum = await newForum.save();

    // test en el runtime
    return res
      .status(savedForum ? 200 : 404)
      .json(savedForum ? savedForum : "error al crear el post");
  } catch (error) {
    return res.status(404).json({
      error: "error catch create post",
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ GET BY ID--------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forumtById = await Comment.findById(id);
    if (forumtById) {
      return res.status(200).json(forumtById);
    } else {
      return res.status(404).json("no se ha encontrado el post");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ DELETAR POST/FORUM-----------------------------------------------
//-------------------------------------------------------------------------------------------------
//! ver con el equipo

/*const deleteComment = async (req, res, next) => {
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
};*/
module.exports = { createForum, getById }; 

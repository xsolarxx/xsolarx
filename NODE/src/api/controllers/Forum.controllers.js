const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR POST/FORUM-------------------------------------------------
//-------------------------------------------------------------------------------------------------
const createForum = async (req, res, next) => {
  try {
    await Forum.syncIndexes();
    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.user._id,
    };

    const newForum = new Forum(customBody);
    const savedForum = await newForum.save();
    
      if(savedForum)
      {
      try {
      await User.findByIdAndUpdate(req.user._id,{
        $push : {forumOwner : newForum._id,}
      })
      return res.status(200).json("El usuario ha creado el foro");
      } catch (error) {
        return res.status(404).json({
          error: "error catch create foro",
          message: error.message,
        });
        
      }
        
      }
    
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
    const forumtById = await Forum.findById(id);
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
// ------------------------------GET BY ALl-----------------------------------------------
//-------------------------------------------------------------------------------------------------
const getAll = async (req, res, next) => {
  try {
    const allForum = await Forum.find().populate("comment")
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

//-------------------------------------------------------------------------------------------------
// ------------------------------ DELETAR POST/FORUM-----------------------------------------------
//-------------------------------------------------------------------------------------------------

const deleteComment = async (req, res, next) => {
  try {
    // extrai el id del comentario de los parametros de solicitacion http
    const { id } = req.params;

    // Validación básica del ID
    if (!id) {
      // si no tiene el id

      return res
        .status(400)
        .json({ error: "ID del comentario no proporcionado" });
    }
    // verificar si el comentario se eliminó correctamente
    const comment = await Comment.findByIdAndDelete(id); // const para buscar y borrar
    if (!comment) {
      return res.status(400).json({ error: "Comentario no encotrado" });
    }
  } catch (error) {}
};

module.exports = { createForum, getById };

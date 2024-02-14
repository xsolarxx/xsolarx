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
    const allForum = await Forum.find();
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

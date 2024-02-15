const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// -------------------------------*CREAR POST/FORUM*-------------------------------------------------

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

    if (savedForum) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { forumOwner: newForum._id },
        });
        return res.status(200).json("El usuario ha creado el foro");
      } catch (error) {
        return res.status(404).json({
          error: "Error tipo catch al crear el foro",
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error tipo catch encontrado al crear el foro",
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
    const forumById = await Forum.findById(id);
    if (forumById) {
      return res.status(200).json(forumById);
    } else {
      return res.status(404).json("No se ha encontrado el post");
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
    const allForum = await Forum.find().populate("comment");
    /** el find nos devuelve un array */
    if (allForum.length > 0) {
      // Verifica si se encontraron foros
      return res.status(200).json(allForum);
    } else {
      return res.status(404).json("No se encontraron foros");
    }
  } catch (error) {
    return res.status(404).json({
      // Si ocurre un error durante la búsqueda de foros, devuelve una respuesta con estado 500 y el mensaje de error
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//-------------------------------------------------------------------------------------------------
// ------------------------------ DELETAR POST/FORUM-----------------------------------------------
//-------------------------------------------------------------------------------------------------
//! testar en insonmia
const deleteForum = async (req, res, next) => {
  try {
    // extrai el id del comentario de los parametros de solicitacion http
    const { id } = req.params;
    // Validación básica del ID
    if (!id) {
      // si no tiene el id
      return res.status(400).json({ error: "ID del forum no proporcionado" });
    }
    // verificar si el comentario se eliminó correctamente
    const forum = await Forum.findByIdAndDelete(id); // const para buscar y borrar
    if (!Forum) {
      return res.status(400).json({ error: "forum no encotrado" });
    }
    await Promise.all([
      // Eliminar las referencias al foro en otras colecciones
      User.updateMany({ forumOwner: id }, { $pull: { forumOwner: id } }),
      User.updateMany(
        { forumFollowing: id },
        { $pull: { forumFollowing: id } }
      ),
    ]);
    return res
      .status(200)
      .json({ exito: true, mensaje: "Foro eliminado correctamente" });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Error al eliminar el foro", mensaje: error.message });
  }
};

module.exports = { createForum, getById, getAll, deleteForum };

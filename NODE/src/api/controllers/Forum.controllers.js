const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// -----------------------------*CREATE POST/FORUM*-------------------------------------------------

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

// -------------------------------*GET BY ID*--------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forumById = await Forum.findById(id);
    if (forumById) {
      return res.status(200).json(forumById);
    } else {
      return res.status(404).json("No se ha encontrado el foro");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

// -------------------------------*GET ALL*-------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allForum = await Forum.find().populate("comment");
    /* El find nos devuelve un array */
    if (allForum.length > 0) {
      // Verifica si se encontraron foros
      return res.status(200).json(allForum);
    } else {
      return res.status(404).json("No se encontraron foros");
    }
  } catch (error) {
    return res.status(404).json({
      // Si ocurre un error durante la búsqueda de foros, devuelve una respuesta con estado 500 y el mensaje de error
      error: "Error en la búsqueda. Lanzado en el catch",
      message: error.message,
    });
  }
};

// -------------------------------*DELETE POST/FORUM*-----------------------------------------------

//! testar en insonmia
const deleteForum = async (req, res, next) => {
  try {
    // Se extrae el id del comentario de los parametros de la solicitud http
    const { id } = req.params;
    // Validación básica del id
    if (!id) {
      // Si no tiene el id devuelve el siguiente error
      return res.status(400).json({ error: "Id del foro no proporcionado" });
    }
    // Se verifica si el comentario se eliminó correctamente
    const forum = await Forum.findByIdAndDelete(id); // const para buscar y borrar
    if (!Forum) {
      return res.status(400).json({ error: "El foro no ha sido encontrado" });
    }
    await Promise.all([
      // Elimina las referencias al foro en otras colecciones
      User.updateMany({ forumOwner: id }, { $pull: { forumOwner: id } }),
      User.updateMany(
        { forumFollowing: id },
        { $pull: { forumFollowing: id } }
      ),
    ]);
    return res
      .status(200)
      .json({ exito: true, mensaje: "Foro eliminado correctamente" }); //Spanish) exito y mensaje?
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Error al eliminar el foro", message: error.message });
  }
};

module.exports = { createForum, getById, getAll, deleteForum };

//Se han realizado pequeñas correcciones gramaticales tanto en inglés como en español.

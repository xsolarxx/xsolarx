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
    const existForum = await Forum.findById(id)
    if (!forum) {
      return res.status(400).json({ error: "El foro no ha sido encontrado" });
    }
    deleteImgCloudinary(Forum.image);
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
      .json({ delete: true, mensaje: "Foro eliminado correctamente" }); //Spanish) exito y mensaje?
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Error al eliminar el foro", message: error.message });
  }
};

//Se han realizado pequeñas correcciones gramaticales tanto en inglés como en español.
//!----------------------------------------------------------------------------------
//-----------------------------------UPDATE------------------------------------------
//!----------------------------------------------------------------------------------

const update = async (req,res, next) => {

  await Forum.syncIndexes();
  let catchImg = req.file?.path;
  try {
    await Forum.syncIndexes();
    const { id } = req.params;
    const forumById = await Forum.findById(id);
    if (forumById){
      const oldImg = forumById.image;

      const customBody = {
        _id: forumById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : ForumById,
        author: req.body?.author ? req.body?.author : forumById.author,
        content: req.body?.content ? req.body?.content : forumById.content,
      };

        try {
          await Forum.findByIdAndUpdate(id, customBody);
          if (req.file?.path) {
            deleteImgCloudinary(oldImg);
          }
          //** ------------------------------------------------------------------- */
          //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
          //** ------------------------------------------------------------------- */
  
          // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID
  
          const forumByIdUpdate = await Forum.findById(id);
  
          // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
          const elementUpdate = Object.keys(req.body);
  
          /** vamos a hacer un objeto vacion donde meteremos los test */
  
          let test = {};
  
          /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */
  
          elementUpdate.forEach((item) => {
            if (req.body[item] === forumByIdUpdate[item]) {
              test[item] = true;
            } else {
              test[item] = false;
            }
          });
  
          if (catchImg) {
            forumByIdUpdate.image === catchImg
              ? (test = { ...test, file: true })
              : (test = { ...test, file: false });
          }
          /** vamos a ver que no haya ningun false. Si hay un false lanzamos un 404,
           * si no hay ningun false entonces lanzamos un 200 porque todo esta correcte
           */
          let acc = 0;
          for (clave in test) {
            test[clave] == false && acc++;
          }
  
          if (acc > 0) {
            return res.status(404).json({
              dataTest: test,
              update: false,
            });
          } else {
            return res.status(200).json({
              dataTest: test,
              update: true,
            });
          }
        } catch (error) {}
      } else {
        return res.status(404).json("este post no existe");
      }
    } catch (error) {
      return res.status(404).json(error);
    };
  };

  module.exports = { createForum, getById, getAll, deleteForum, update };
      
    

  

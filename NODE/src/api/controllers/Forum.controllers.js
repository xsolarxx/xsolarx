const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// -----------------------------* CREATE POST/FORUM *-------------------------------------------------

const createForum = async (req, res, next) => {
  try {
    await Forum.syncIndexes();
    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.user._id,
    };

    const newForum = new Forum(customBody);
    if (req.file) {
      newForum.image = req.file.path;
    } else {
      newForum.image =
        "https://res.cloudinary.com/dwmvkaxhd/image/upload/v1707990858/ivdtdpxscvnggdzr2hgt.jpg";
    }
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

// -------------------------------* GET BY ID *--------------------------------------------------------

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

//---------------------------------* GET ALL *-------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allForums = await Forum.find();
    if (allForums.length > 0) {
      // Verifica si se encontraron los foros
      return res.status(200).json(allForums);
    } else {
      return res.status(404).json("No se encontraron los foros");
    }
  } catch (error) {
    return res.status(404).json({
      // Si ocurre un error durante la búsqueda de foros, devuelve un 500 y el mensaje de error
      error: "Error en la búsqueda. Lanzado en el catch",
      message: error.message,
    });
  }
};

//-----------------------------------* UPDATE *-------------------------------------------

const update = async (req, res, next) => {
  await Forum.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const forumById = await Forum.findById(id);
    if (forumById) {
      const oldImg = forumById.image;

      const customBody = {
        _id: forumById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : forumById,
        content: req.body?.content ? req.body?.content : forumById.content,
      };

      try {
        await Forum.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }
        //*forumowner ,,recipienforum comment , forum following, forum follower, likes forum ( 3 de user y uno de comment)
        //----------------------* Test *----------------------------------------------------------------

        //Se busca el elemento actualizado vía id
        const forumByIdUpdate = await Forum.findById(id);

        // Se sacan las claves del req.body para saber qué elementos actualizar
        const elementUpdate = Object.keys(req.body);

        // Objeto vacío donde posteriormente se meterán los test
        let test = {};

        // Se recorren las claves del body y se crea un objeto con los test
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

        // Se comprueba si hay un "false". Hay false --> Se lanza un 404.
        // Si no hay false --> Se lanza un 200, todo OK.

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
      return res.status(404).json("Este foro no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

// -------------------------------* DELETE POST/FORUM *-----------------------------------------------

const deleteForum = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica si id está definido, si no está, lanza error.
    if (!id) {
      throw new Error("Id de foro no proporcionado");
    }

    // Elimina el foro
    await Forum.findByIdAndDelete(id);
    console.log("ID del Foro eliminado:", id);

    // Busca todos los comentarios del foro
    //
    const allComentsInForum = await Comment.find({ recipientForum: id });
    const commentIds = allComentsInForum.map((comment) => comment._id);

    // Actualiza las referencias de los modelos de datos
    await User.updateMany({ likedForum: id }, { $pull: { likedForum: id } });

    await User.updateMany(
      { forumFollowing: id },
      { $pull: { forumFollowing: id } }
    );

    await User.updateOne({ forumOwner: id }, { $pull: { forumOwner: id } });

    await Comment.deleteMany({ recipientForum: id });

    await Promise.all(
      //! Por qué estás haciendo un loop de commentIds, pasándoles idElement el cual hace referenia a commentId a todos los demás?
      commentIds.map(async (idElement) => {
        await User.updateMany(
          { likedForum: idElement },
          { $pull: { likedForum: idElement } }
        );
        await Comment.updateMany(
          { recipientForum: idElement },
          { $pull: { recipientForum: idElement } }
        );
        await User.updateMany(
          { forumFollowing: idElement },
          { $pull: { forumFollowing: idElement } }
        );
        await User.updateOne(
          { forumOwner: idElement },
          { $pull: { forumOwner: idElement } }
        );
      })
    );
    return res
      .status(200)
      .json({ message: "Foro y sus dependencias eliminados correctamente" });
  } catch (error) {
    return res.status(500).json({
      error: "Error eliminando el foro",
      message: error.message,
    });
  }
};

//------------------------------------------------------------------------------
module.exports = { createForum, getById, getAll, update, deleteForum };

//Ok excepto delete

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
//? NO ESTA BIEN. Solo borra el foro, no los likes dentro del user que le dio like a un comentario dentro del foro
const deleteForum = async (req, res, next) => {
  try {
    const { idForum } = req.params;
    // Elimina el comentario
    await Forum.findByIdAndDelete(idForum);
    console.log("ID del Foro eliminado:", idForum);
    // Actualiza las referencias de los modelos de datos
    try {
      await User.updateMany(
        { likedForum: idForum },
        { $pull: { likedForum: idForum } }
      );
      try {
        await User.updateMany(
          { forumFollowing: idForum },
          { $pull: { forumFollowing: idForum } }
        );
        try {
          await User.updateOne(
            { forumOwner: idForum },
            { $pull: { forumOwner: idForum } }
          );
          try {
            await Comment.updateMany(
              { recipientForum: idForum },
              { $pull: { recipientForum: idForum } }
            );
            await Forum.deleteMany({ forumOwner: idForum });

            Promise.all(
              User.updateMany(
                { likedForum: idForum },
                { $pull: { likedForum: idForum } }
              ),
              Comment.updateMany(
                { recipientForum: idForum },
                { $pull: { recipientForum: idForum } }
              ),
              User.updateMany(
                { forumFollowing: idForum },
                { $pull: { forumFollowing: idForum } }
              ),
              User.updateMany(
                { forumOwner: idForum },
                { $pull: { forumOwner: idForum } }
              )
            ).then(async () => {
              console.log("entro");
              // si sale bien la promesa
              return res.status(200).json("forum borrado");
            });
          } catch (error) {
            return res.status(404).json({
              error: "Error eliminando comentario del forum",
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: "Error eliminando el owner del forum ",
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "Error eliminando el following del Forum ",
          message: error.message,
        });
      }
    } catch (error) {
      return res.status(404).json({
        error: "Error eliminando el like del Forum",
        message: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error general",
      message: error.message,
    });
  }
};

//------------------------------------------------------------------------------
module.exports = { createForum, getById, getAll, update, deleteForum };

//Ok excepto delete

const User = require("../models/User.model");
const News = require("../models/News.model");
const Comment = require("../models/Comment.model");

//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR NEWS -------------------------------------------------
//-------------------------------------------------------------------------------------------------

const createNews = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await News.syncIndexes(); //
    const customBody = {
      title: req.body?.title,
      shortContent: req.body?.shortContent,
      fullContent: req.body?.fullContent,
      author: req.body?.author,
      tags: req.body?.tags, // pensar en funcion del enum
      image: req.file?.path,
      ownerAdmin: req.user._id,
    };
    const newNews = new News(customBody);
    if (req.file) {
      newNews.image = req.file.path;
    } else {
      newNews.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
    }
    const savedNews = await newNews.save(); // el await espera a que se resuelva la promesa
    if (savedNews) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { newsOwnerAdmin: newNews._id },
        });
        return res.status(200).json("El admin ha creado la noticia");
      } catch (error) {
        return res.status(404).json({
          error:
            "Se ha encontrado error catch al crear la noticia por el admin",
          message: error.message,
        });
      }
    }
  } catch (error) {
    // en caso de cualquier probelma, al principio de la función el catch se encarga de borrar la imagen, si se ha adjuntado una imagen
    if (req.file) {
      deleteImgCloudinary(catchImg);
    }
    return res.status(404).json({
      error:
        "error creando la noticia, imagen ha sido borrada en caso de haber sido adjunta",
      message: error.message,
    });
  }
};

module.exports = { createNews };

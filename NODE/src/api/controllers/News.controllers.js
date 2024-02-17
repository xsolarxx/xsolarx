const User = require("../models/User.model");
const News = require("../models/News.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const enumOk = require("../../utils/enumOk");

// ------------------------------ CREAR NEWS ------------------------------------------------------

const createNews = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await News.syncIndexes();
    const newsExist = await News.findOne({ title: req.body.title });
    if (newsExist) {
      return res.status(409).json("Título repetido");
    }
    const customBody = {
      title: req.body?.title,
      shortContent: req.body?.shortContent,
      fullContent: req.body?.fullContent,
      author: req.body?.author,
      ownerAdmin: req.user._id,
    };
    const newNews = new News(customBody);
    if (req.file) {
      newNews.image = req.file.path;
    } else {
      newNews.image =
        "https://res.cloudinary.com/dwmvkaxhd/image/upload/v1707990858/ivdtdpxscvnggdzr2hgt.jpg";
    }
    if (req.body?.tags) {
      const resultEnum = enumOk("enumTags", req.body?.tags);
      newNews.tags = resultEnum.check ? req.body?.tags : "otros"; //Seleccionamos otros como opción
    }

    const savedNews = await newNews.save(); // el await espera a que se resuelva la promesa
    if (savedNews) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { newsOwnerAdmin: newNews._id },
        });
        return res.status(200).json(newNews);
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

//------------------------------------* GET ALL*----------------------------------------------------
const getAll = async (req, res, next) => {
  try {
    const allNews = await News.find();
    /** el find nos devuelve un array */
    if (allNews.length > 0) {
      return res.status(200).json(allNews);
    } else {
      return res.status(404).json("no se han encontrado notícias");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//------------------------------------* GET BY ID *----------------------------------------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const NewsById = await News.findById(id);
    if (NewsById) {
      return res.status(200).json(NewsById);
    } else {
      return res.status(404).json("no se ha encontrado la noticia");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//------------------------------------* GET BY TAGS *----------------------------------------------------
const getByTags = async (req, res, next) => {
  try {
    const { tags } = req.body;
    const NewsByTags = await News.find({ tags: tags }); // procurar las noticias con base en las tags
    if (NewsByTags.length > 0) {
      // verifica si hay noticias
      return res.status(200).json(NewsByTags);
    } else {
      return res.status(404).json("No ha fornecido la tag");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//------------------------------------* UPDATE NEWS *----------------------------------------------------
const update = async (req, res, next) => {
  await News.syncIndexes();
  let catchImg = req.file?.path;
  try {
    await News.syncIndexes();
    const { id } = req.params;
    const newsById = await News.findById(id);
    if (newsById) {
      const oldImg = newsById.image;

      const customBody = {
        _id: newsById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : newsById.title,
        author: req.body?.author ? req.body?.author : newsById.author,
        //?Por que cuando ponemos tags en el custom body e intentamos hacer el update nos sale error en el imsonia???
        //*tags: req.body?.tags ? req.body?.tags : newsById.tags,
        shortContent: req.body?.shortContent
          ? req.body?.shortContent
          : newsById.shortContent,
        fullContent: req.body?.fullContent
          ? req.body?.fullContent
          : newsById.fullContent,
      };
      if (req.body?.tags){
        const result = enumOk ("enumTags", req.body?.tags)
        customBody.tags = result.check 
        ?req.body?.tags
        :newsById.tags    
      }

      try {
        await News.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }
        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const newsByIdUpdate = await News.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === newsByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          newsByIdUpdate.image === catchImg
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
      return res.status(404).json("esta noticia no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};


//?||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//!································DELETE··································
//?||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||


const deleteNews = async (req, res, next) => {
  try {
    
    const { id } = req.params;
    // Validación básica del id
    if (!id) {
      // Si no tiene el id devuelve el siguiente error
      return res.status(400).json({ error: "Id del foro no proporcionado" });
    }
    // Se verifica si el comentario se eliminó correctamente
    const news = await News.findByIdAndDelete(id); // const para buscar y borrar
    if (!news) {
      return res.status(400).json({ error: "La notícia no ha sido encontrada" });
    }
    await Promise.all([
      // Elimina las referencias al foro en otras colecciones
      User.updateMany({ newsOwnerAdmin: id }, { $pull: { forumOwner: id } }),
      User.updateMany(
        { likedNews: id },
        { $pull: { likedNews: id } }),
      Comment.updateMany({recipientNews: id},
          {$pull: {recipientNews: id}})
      
    ]);
    return res
      .status(200)
      .json({ exito: true, mensaje: "Notícia eliminada correctamente" }); //Spanish) exito y mensaje?
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Error al eliminar la notícia", message: error.message });
  }
};

module.exports = { createNews, getAll, getById, update, getByTags, deleteNews };

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
      newNews.tags = resultEnum.check ? req.body?.tags : "Otros"; //Seleccionamos otros como opción
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
    const { id } = req.params;
    const newsById = await News.findById(id);
    if (newsById) {
      const oldImg = newsById.image;

      // Construye el objeto de campos personalizado para la actualización
      const customBody = {
        _id: newsById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : newsById.title,
        author: req.body?.author ? req.body?.author : newsById.author,
        shortContent: req.body?.shortContent
          ? req.body?.shortContent
          : newsById.shortContent,
        fullContent: req.body?.fullContent
          ? req.body?.fullContent
          : newsById.fullContent,
      };

      // Verifica si hay etiquetas en la solicitud y las valida
      if (req.body?.tags) {
        const result = enumOk("enumTags", req.body?.tags);
        customBody.tags = result.check ? req.body?.tags : newsById.tags;
      }

      try {
        // Actualiza la noticia por su ID con los campos personalizados
        await News.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //----------------------* Test *----------------------------------------------------------------

        //Se busca el elemento actualizado vía id
        const newsByIdUpdate = await News.findById(id);

        // Se sacan las claves del req.body para saber qué elementos actualizar
        const elementUpdate = Object.keys(req.body);

        // Objeto vacío donde posteriormente se meterán los test
        let test = {};

        // Se recorren las claves del body y se crea un objeto con los test
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
      return res.status(404).json("esta noticia no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

//------------------------------------* DELETE *----------------------------------------------------

//! SOLO CONSEGUIMOS QUE BORRE LA NOTICIA Y EL LIKE DEL USUARIO, PERO SI EL USUARIO HA COMENTADO LA NOTICIA EL COMENTARIO NO SONSEGUIMOS CORRARLO
//! SEGURAMENTE NO TIENE MANERA DE SABER QUE USUARIO HA PUESTO EL COMENTARIO, NO? YA QUE ESTA EN UN MODELO QUE NO ES EL DE USER, MIENTRAS QUE EL LIKE ESTA EN EL MODELO DE USER

const deleteNews = async (req, res, next) => {
  // Extraer el ID de la compañía de los parámetros de la solicitud HTTP
  const { id } = req.params;
  // Verificar si la compañía existe antes de eliminarla
  const NewsExist = await News.findById(id);

  if (NewsExist) {
    await News.findByIdAndDelete(id);
    const newsDelete = await News.findById(id);

    if (!newsDelete) {
      deleteImgCloudinary(NewsExist.image);

      try {
        await User.updateMany({ likedNews: id }, { $pull: { likedNews: id } });
        await User.updateMany({ comments: id }, { $pull: { comments: id } });
        await News.deleteMany({ comments: id });
      } catch (error) {
        return res.status(404).json({
          error: "News no ha sido borrado",
        });
      }
      //! --------------------
    } else {
      return res.status(404).json({
        error: "News no existe",
      });
    }
  }
  return res
    .status(200)
    .json({ success: true, message: "News eliminada correctamente" });
};

//---------------------------------------------------------------------------------------------------

module.exports = { createNews, getAll, getById, update, getByTags, deleteNews };

// Ok except Del

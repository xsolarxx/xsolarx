//! In progress

const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
//const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// ------------------------------ CREAR RATING-------------------------------------------------

const createRating = async (req, res, next) => {
  try {
    await Rating.syncIndexes();

    const customBody = {
      punctuation: req.body?.punctuation,
      userPunctuation: req.body?.userPunctuation,
      companyPunctuated: req.body?.companyPunctuated,
    };
    const rating = new Rating(customBody);
    const savedRating = await newRating.save();

    // 1)   Runtime test
    return res
      .status(savedRating ? 200 : 404)
      .json(savedRating ? savedRating : "Error al realizar el rating");
  } catch (error) {
    return res.status(404).json({
      error: "Error catch al crear el rating",
      message: error.message, // Comunica info sobre el error que se capturó
    });
  }
};

//                            * GET BY ALL *

const getAll = async (req, res, next) => {
  try {
    const allRating = await Comment.find();
    /** el find nos devuelve un array */
    if (allComment.length > 0) {
      return res.status(200).json(allComment);
    } else {
      return res.status(404).json("No se han encontrado comentarios");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ UPDATE-----------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const update = async (req, res, next) => {
  await Comment.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id);
    if (commentById) {
      const oldImg = commentById.image;

      const customBody = {
        _id: commentById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : commentById.title,
      };

      if (req.body?.gender) {
        const resultEnum = enumOk(req.body?.gender);
        customBody.gender = resultEnum.check
          ? req.body?.gender
          : characterById.gender;
      }

      try {
        await Comment.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //** ------------------------------------------------------------------- */
        //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
        //** ------------------------------------------------------------------- */

        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const commentByIdUpdate = await Comment.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === commentByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          characterByIdUpdate.image === catchImg
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
      return res.status(404).json("este comentario no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

module.exports = { deleteComment, createComment, getAll, getById, update };

// module.exports = {  getAll, getById, update };

//! In progress!! It´s not ready yet.

const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
//const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//------------------------------------* CREATE RATING *----------------------------------------------------
//! CHEQUEAR ESTA ESTRUCTURA, HAY DUDAS.
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

//!EN NOTION SALE GET BY ID PERO CREO QUE NO ES NECESARIO. HAY QUE CONFIRMAR.

// ---------------------------------------* UPDATE *------------------------------------------------------
//solo estructura copiada , no completo.

/*const update = async (req, res, next) => {
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


        //------------------*TEST EN TIEMPO REAL PARA COMPROBAR QUE SE HA HECHO CORRECTAMENTE *-------------------

        /* Se busca el elemento actualizado por el ID
        const commentByIdUpdate = await Comment.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /* vamos a hacer un objeto vacion donde meteremos los test */

let test = {};

/* vamos a recorrer las claves del body y vamos a crear un objeto con los test

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
        }  */

// ----------------------------* BORRAR RATING DE COMPAÑÍA--------------------------------------------

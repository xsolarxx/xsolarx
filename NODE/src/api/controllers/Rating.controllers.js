const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
const Company = require("../models/Company.model");

//------------------------------------* CREATE RATING *----------------------------------------------------

const createRating = async (req, res, next) => {
  try {
    await Rating.syncIndexes();

    if (req.user.companyPunctuated.includes(req.body.companyPunctuated)) {
      return res.status(404).json("Este usuario ya ha puntuado la empresa ");
    }

    const customBody = {
      punctuation: req.body?.punctuation,
      userPunctuation: req.user._id,
      companyPunctuated: req.body?.companyPunctuated,
    };
    console.log(customBody);
    const newRating = new Rating(customBody);
    const savedRating = await newRating.save();
    console.log(savedRating);
    if (savedRating) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { ownerRating: savedRating._id },
        });
        await User.findByIdAndUpdate(req.user._id, {
          $push: { companyPunctuated: req.body.companyPunctuated },
        });
        try {
          await Company.findByIdAndUpdate(req.body.companyPunctuated, {
            $push: { userCompanyRatings: savedRating._id },
          });
          return res.status(200).json({
            rating: await Rating.findById(savedRating._id),
            user: await User.findById(req.user._id),
          });
        } catch (error) {
          return res.status(404).json({
            error: "Error catch al actualizar la empresa",
            message: error.message, // Comunica info sobre el error que se capturó
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "Error catch al actualizar el user",
          message: error.message,
        });
      }
    } else {
      return res.status(404).json({
        error: "Rating no guardado",
      });
    }
    // 1)   Runtime test
  } catch (error) {
    return res.status(404).json({
      error: "Error catch al crear el rating",
      message: error.message,
    });
  }
};

// --------------------------------* GET ALL *-------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allRating = await Rating.find().populate("userCompanyRatings");
    if (allRating.length > 0) {
      return res.status(200).json(allRating);
    } else {
      return res.status(404).json("No se han encontrado ratings");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error durante la búsqueda - lanzado en el catch",
      message: error.message,
    });
  }
};

//---------------------------------------* GET BY ID *---------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ratingById = await Rating.findById(id);
    if (ratingById) {
      return res.status(200).json(ratingById);
    } else {
      return res.status(404).json("No se ha encontrado el rating");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error durante la búsqueda - lanzado en el catch",
      message: error.message,
    });
  }
};

// --------------------------------* UPDATE *--------------------------------------------------------
//Para que el user pueda modificar su rating previamente puesto a una compañía

const update = async (req, res, next) => {
  await Rating.syncIndexes();
  try {
    const { id } = req.params;
    const ratingById = await Rating.findById(id);
    if (ratingById) {
      const customBody = {
        punctuation: req.body?.punctuation ? req.body?.punctuation : ratingById,
      };
      try {
        await Rating.findByIdAndUpdate(id, customBody);

        //-----------------------* Test * -------------------------------------------------------
        //Se busca el elemento actualizado vía id
        const ratingByIdUpdate = await Rating.findById(id);

        // Se sacan las claves del req.body para saber qué elementos actualizar
        const elementUpdate = Object.keys(req.body);

        // Objeto vacío donde posteriormente se meterán los test
        let test = {};

        // Se recorren las claves del body y se crea un objeto con los test
        elementUpdate.forEach((item) => {
          if (req.body[item] === ratingByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });
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
      return res.status(404).json("Este rating no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

//------------------------------------------------------------------------------------------
module.exports = { createRating, getAll, getById, update };

//Ok

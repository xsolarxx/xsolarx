//! In progress.

const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

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

// module.exports = {  getAll, getById, update };

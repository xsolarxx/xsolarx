// const Company = require("../models/Company.model");
// const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR COMPANY -------------------------------------------------
//-------------------------------------------------------------------------------------------------

const createCompany = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await Company.syncIndexes();

    const newCompany = {
      companyName: req.body?.companyName,
      description: req.body?.description,
      companyServices: req.body?.companyServices,
      companyType: req.body?.companyType,
      image: req.file?.path,
    };
    //! vamos a esperar a hablar con laura el crear el equivalente a "AuthOwner" de News
    try {
      const saveCompany = await newCompany.save();
      if (saveCompany) {
        return res.status(200).json(saveCompany);
      } else {
        return res
          .status(404)
          .json("No se ha podido guardar la Company en la DB ❌");
      }
    } catch (error) {
      console.error("Error saving Company:", error);
      return res.status(404).json("Error general saving Company");
    }
  } catch (error) {
    req.file?.path && deleteImgCloudinary(catchImg);
    console.error("Error creating Company:", error);
    return res.status(404).json({
      message: "Error creating Company",
      error: error,
    });
  }
};

// module.exports = { createCompany };

//-------------------------------------------------------------------------------------------------
// ------------------------------ getByName--------------------------------------------------------
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// ------------------------------ getById --------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyById = await Company.findById(id);
    if (companyById) {
      return res.status(200).json(companyById);
    } else {
      return res.status(404).json("no se ha encontrado la company");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ getByServices--------------------------------------------------------
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// ------------------------------ Delete --------------------------------------------------------
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// ------------------------------ Update --------------------------------------------------------
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// ------------------------------ getByLessLikes --------------------------------------------------------
//-------------------------------------------------------------------------------------------------

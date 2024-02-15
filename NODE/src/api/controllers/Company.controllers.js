// const Company = require("../models/Company.model");
// const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const enumOk = require("../../utils/enumOk");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR COMPANY -------------------------------------------------
//-------------------------------------------------------------------------------------------------

const createCompany = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await Company.syncIndexes();
    const companyExist = await Company.findOne({
      companyName: req.body.companyName,
    });
    if (companyExist) {
      return res.status(409).json("Esta empresa ya existe");
    }
    const customBody = {
      companyName: req.body?.companyName,
      description: req.body?.description,
      companyType: req.body?.companyType,
      image: req.file?.path,
    };
    const newCompany = new Company(customBody);
    if (req.body?.companyServices) {
      const resultEnum = enumOk("enumServices", req.body?.companyServices);
      newCompany.companyServices = resultEnum.check
        ? req.body?.companyServices
        : "otros";
    }
    const savedCompany = await newCompany.save();
    if (savedCompany) {
      try {
        //const savedCompany = await newCompany.save();
        await User.findByIdAndUpdate(req.user._id, {
          $push: { companyOwnerAdmin: newCompany._id },
        });
        return res.status(200).json(newCompany);
      } catch (error) {
        return res.status(404).json({
          error:
            "Se ha encontrado error catch al crear la compañia por el admin",
          message: error.message,
        });
      }
    }
  } catch (error) {
    if (req.file) {
      deleteImgCloudinary(catchImg);
    }
    return res.status(404).json({
      error:
        "error creando la empresa, imagen ha sido borrada en caso de haber sido adjunta",
      message: error.message,
    });
  }
};

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
module.exports = { createCompany };

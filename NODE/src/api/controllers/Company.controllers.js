const enumOk = require("../../utils/enumOk");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// ------------------------------*CREATE COMPANY* -------------------------------------------------
//! LAURA.COMO CREAR UN SORT BY EL QUE MÁS LIKES TIENE. QUIZÁ CON 1º GETALL Y LUEGO EN JS CON SORT METHOD.

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
        await User.findByIdAndUpdate(req.user._id, {
          $push: { companyOwnerAdmin: newCompany._id },
        });
        return res.status(200).json(newCompany);
      } catch (error) {
        return res.status(404).json({
          error:
            "Se ha encontrado error catch al crear la compañía por el admin",
          message: error.message,
        });
      }
    }
  } catch (error) {
    if (req.file) {
      deleteImgCloudinary(catchImg);
    }
    return res.status(404).json({
      error: "Error creando la empresa. Imagen ha sido borrada si fue adjunta",
      message: error.message,
    });
  }
};
// -------------------------------*GET BY NAME*--------------------------------------------------------
const getByName = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const companyByName = await Company.find({ companyName: companyName });
    if (companyByName.length > 0) {
      //si el array tiene length > 0, indica si existe 1 compañía con este nombre.
      return res.status(200).json(companyByName);
    } else {
      return res.status(404).json("No se ha encontrado la compañía");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error tipo catch al buscar por nombre la compañía",
      message: error.message,
    });
  }
}; //!TEST NO SE HA ENCONTRADO LA COMPAÑÍA
// --------------------------------*GET BY ID*-------------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyById = await Company.findById(id);
    if (companyById) {
      return res.status(200).json(companyById);
    } else {
      return res.status(404).json("No se ha encontrado la compañía");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//--------------------------------*GET BY SERVICES*---------------------------------------------------------
//!PREGUNTAR COMO APLICAR EL ENUM EN NUESTROS GET BY. TENEMOS QUE REALIZAR 1 EJEMPLO DE UPDATE Y DELETE TAMBIEN
//!De este array de servicios, de este servicio en particular, dame las compañías que lo tienen.

const getByServices = async (req, res, next) => {
  try {
    const { companyServices } = req.body;
    const newcompanyByService = await Company.find({
      companyServices: companyServices,
    });

    if (newcompanyByService.length > 0) {
      //si el array tiene length > 0, indica si existe 1 compañía con este nombre.
      return res.status(200).json(newcompanyByService);
    } else {
      return res.status(404).json("No fue encontrado el service");
    }
  } catch (error) {
    return res.status(404).json("Error al buscar el service");
  }
};
// --------------------------------*DELETE*--------------------------------------------------------

// --------------------------------*UPDATE*--------------------------------------------------------

// --------------------------------*GET BY LIKES*--------------------------------------------------

module.exports = { createCompany, getById, getByName, getByServices };

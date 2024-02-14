
const Company = require("../models/Company.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");


const createCompany = async (req, res, next) => {
    let catchImg = req.file?.path;
    try {
      await Company.syncIndexes();
     /** hacemos una instancia del modelo  */
      const newCompany = new Company(req.body);
      if (req.file) {
        newCompany.image = catchImg;
      }
      try {
        const saveCompany = await newCompany.save();
        if (saveCompany) {
          return res.status(200).json(saveCompany);
        } else {
          return res.status(404).json("No se ha podido guardar la Company en la DB ❌");
        }
      } catch (error) {
        return res.status(404).json("error general saving Company");
      }
    } catch (error) {
      req.file?.path && deleteImgCloudinary(catchImg);
      return (
        res.status(404).json({
          messege: "error creando Company",
          error: error,
        }) && next(error)
      );
    }
  };


module.exports = { createCompany };
  
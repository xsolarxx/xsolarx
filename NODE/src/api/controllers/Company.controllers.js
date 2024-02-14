const Company = require("../models/Company.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const createCompany = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await Company.syncIndexes();
    const newCompany = new Company(req.body);

    if (req.file) {
      newCompany.image = catchImg;
    }

    const customBody = {
      companyName: req.body?.companyName,
      description: req.body?.description,
      companyType: req.body?.companyType,
      companyServices: req.body?.companyServices,
      image: req.body?.image,
    };

    newCompany = new Company(customBody);


    try {
      const saveCompany = await newCompany.save();
      if (saveCompany) {
        return res.status(200).json(saveCompany);
      } else {
        return res.status(404).json("No se ha podido guardar la Company en la DB ❌");
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


module.exports = { createCompany };
  
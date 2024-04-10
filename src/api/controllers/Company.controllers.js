const enumOk = require("../../utils/enumOk");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
const Rating = require("../models/Rating.model");
const Comment = require("../models/Comment.model");
const validator = require("validator");
// ------------------------------* CREATE COMPANY *--------------------------------------------------

const createCompany = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await Company.syncIndexes();
    const companyExist = await Company.findOne({
      companyName: req.body.companyName,
    });
    if (companyExist) {
      return res.status(409).json("Esta compañía ya existe");
    }
    const processedText = req.body.description.replace(/\r\n|\r|\n/g, "<br>");
    const customBody = {
      companyName: req.body?.companyName,
      description: processedText,
      companyType: req.body?.companyType,
      image: req.file?.path,
      phoneNumber: req.body?.phoneNumber,
      email: req.body?.email,
    };
    const newCompany = new Company(customBody);
    if (req.body?.companyServices) {
      const resultEnum = enumOk("enumServices", req.body?.companyServices);
      newCompany.companyServices = resultEnum.check
        ? req.body?.companyServices
        : "Others";
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
          error: "Error tipo catch al crear la compañía por el admin",
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
        "Error creando la compañía. La imagen ha sido borrada si fue adjunta",
      message: error.message,
    });
  }
};

// -------------------------------* GET BY NAME *--------------------------------------------------------

const getByName = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const companyByName = await Company.find({ companyName: companyName });
    if (companyByName.length > 0) {
      // Si el array tiene length > 0, indica si existe 1 compañía con este nombre
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
};

// --------------------------------* GET ALL *-------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allCompany = await Company.find().populate(
      "userCompanyReviews userCompanyRatings"
    );
    if (allCompany.length > 0) {
      return res.status(200).json(allCompany);
    } else {
      return res.status(404).json("No se han encontrado las compañías");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error durante la búsqueda - lanzado en el catch",
      message: error.message,
    });
  }
};

// --------------------------------* GET BY ID *-------------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyById = await Company.findById(id).populate(
      "userCompanyRatings"
    );
    if (companyById) {
      return res.status(200).json(companyById);
    } else {
      return res.status(404).json("No se ha encontrado la compañía");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

// --------------------------------* GET BY ID POPULATE *-------------------------------------------------------------

const getByIdPopulate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyById = await Company.findById(id).populate(
      "ownerAdmin userCompanyRatings userCompanyReviews userLikedCompany"
    );
    if (companyById) {
      return res.status(200).json(companyById);
    } else {
      return res.status(404).json("No se ha encontrado la compañía");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

//--------------------------------* GET BY SERVICES *---------------------------------------------------------

const getByServices = async (req, res, next) => {
  try {
    const { companyServices } = req.body;
    const newCompanyByService = await Company.find({
      companyServices: companyServices,
    });

    if (newCompanyByService.length > 0) {
      return res.status(200).json(newCompanyByService);
    } else {
      return res
        .status(404)
        .json("No fue encontrada la compañía con ese servicio");
    }
  } catch (error) {
    return res.status(404).json("Error durante la búsqueda del servicio");
  }
};

// --------------------------------* GET BY LIKES *--------------------------------------------------

//* 1) Ordena de manera descendente según la cantidad de 'likes'

const getByDescLikes = async (req, res, next) => {
  try {
    // sort() --> Función de prototype de .prototype.find() de la documentación de mongoose
    // Indica que ordene de manera descendente, para que salgan las valores más altos primero
    const companiesSortedByLikes = await Company.find()
      .sort({
        likesCount: -1,
      })
      .populate("userCompanyRatings");

    if (companiesSortedByLikes.length > 0) {
      return res.status(200).json(companiesSortedByLikes);
    } else {
      return res.status(404).json("No se han encontrado compañías");
    }
  } catch (error) {
    return res
      .status(404)
      .json("Error enseñando las compañías en orden según cantidad de likes");
  }
};

//* 2) Ordena de manera ascendente según la cantidad de 'likes'

const getByAscLikes = async (req, res, next) => {
  try {
    // Indica que ordene de manera ascendente, para que salgan las valores más bajos primero
    const companiesSortedByLikes = await Company.find()
      .sort({
        likesCount: 1,
      })
      .populate("userCompanyRatings");

    if (companiesSortedByLikes.length > 0) {
      return res.status(200).json(companiesSortedByLikes);
    } else {
      return res.status(404).json("No se han encontrado compañías");
    }
  } catch (error) {
    return res
      .status(404)
      .json("Error enseñando las compañías en orden según cantidad de likes");
  }
};

// --------------------------------* LIKES COUNT *--------------------------------------------------------

const UpdatelikesCount = async (companyId, increment) => {
  try {
    //Encuentra id de la compañía y actualiza su likesCount con un incremento( inc -> operador mongoDB)
    await Company.findByIdAndUpdate(companyId, {
      $inc: { likesCount: increment },
    });
  } catch (error) {
    console.error("Error liking company:", error);
  }
};

// --------------------------------* UPDATE COMPANY *--------------------------------------------------------

const updateCompany = async (req, res, next) => {
  await Company.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const companyById = await Company.findById(id);
    if (companyById) {
      const oldImg = companyById.image;

      // Se construye el objeto de campos personalizado para la actualización
      const customBody = {
        _id: companyById._id,
        image: req.file?.path ? catchImg : oldImg,
        description: req.body?.description
          ? req.body?.description
          : companyById.description,
        companyType: req.body?.companyType
          ? req.body?.companyType
          : companyById.companyType,
        phoneNumber: req.body?.phoneNumber,
        email: req.body?.email,
      };
      if (req.body?.companyServices) {
        const result = enumOk("enumServices", req.body?.companyServices);
        customBody.companyServices = result.check
          ? req.body?.companyServices
          : companyById.companyServices;
      }

      try {
        await Company.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //----------------------* Test *----------------------------------------------------------------

        //Se busca el elemento actualizado vía id
        const companyByIdUpdate = await Company.findById(id);

        // Se sacan las claves del req.body para saber qué elementos actualizar
        const elementUpdate = Object.keys(req.body);

        // Objeto vacío donde posteriormente se meterán los test
        let test = {};

        // Se recorren las claves del body y se crea un objeto con los test
        elementUpdate.forEach((item) => {
          if (req.body[item] === companyByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          companyByIdUpdate.image === catchImg
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
      return res.status(404).json("Esta compañía no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

// --------------------------------* DELETE COMPANY *--------------------------------------------------------

const deleteCompany = async (req, res, next) => {
  const { idCompany } = req.params;
  // Busca la compañía a eliminar en la base de datos usando el id
  try {
    const companyToDelete = await Company.findById(idCompany);

    // Se comprueba si el id de la compañía existe
    if (!companyToDelete) {
      return res.status(404).json("Compañia no encontrada");
    }

    /*Con referencia a la dependencia -> Se busca en la BD
    para encontrar users y datos asociados a la compañía que se va a eliminar */
    const reviewToDelete = companyToDelete.userCompanyReviews;
    const ratingToDelete = companyToDelete.userCompanyRatings;

    // Sin referencia a la dependencia -> Se accede a través del user
    const usersToUpdate = await User.find({
      companyPunctuated: companyToDelete._id,
    });
    const OwnerAdminToDelete = await User.find({
      companyOwnerAdmin: companyToDelete._id,
    });

    await Promise.all([
      reviewToDelete.map(async (reviewId) => {
        const user = await User.updateMany(
          { comments: reviewId },
          { $pull: { comments: reviewId } }
        );
        await Comment.findByIdAndDelete(reviewId);
      }),
      ratingToDelete.map(async (ratingId) => {
        const user = await User.updateMany(
          { ownerRating: ratingId },
          { $pull: { ownerRating: ratingId } }
        );
        await Rating.findByIdAndDelete(ratingId);
      }),
      usersToUpdate.map(async (user) => {
        user.companyPunctuated.pull(companyToDelete._id);
        await user.save();
      }),
      OwnerAdminToDelete.map(async (user) => {
        user.companyOwnerAdmin.pull(companyToDelete._id);
        await user.save();
      }),
      // Se eliminan las referencias del likedCompany dentro del User model
      User.updateMany(
        { likedCompany: companyToDelete._id },
        { $pull: { likedCompany: companyToDelete._id } }
      ),
    ]);

    await Company.findByIdAndDelete(idCompany);

    return res.status(200).json("Compañía eliminada correctamente");
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error eliminando la compañía", message: error.message });
  }
};

//---------------------------------------------------------------------------------------------------
module.exports = {
  createCompany,
  getById,
  getByName,
  getByServices,
  getAll,
  getByDescLikes,
  getByAscLikes,
  UpdatelikesCount,
  updateCompany,
  deleteCompany,
  getByIdPopulate,
};

//Ok todo

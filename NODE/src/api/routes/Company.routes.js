const { isAuthAdmin } = require("../../middleware/auth.middleware");
const {
  createCompany,
  getByName,
  getById,
  getByServices,
} = require("../controllers/Company.controllers");
const { upload } = require("../../middleware/files.middleware");

const CompanyRoutes = require("express").Router();

//* upload.single("image") y upload middleware para poder subir imagenes por media

CompanyRoutes.post(
  "/create",
  [isAuthAdmin],
  upload.single("image"),
  createCompany
);
CompanyRoutes.get("/byName", getByName);
CompanyRoutes.get("/:id", getById);
CompanyRoutes.get("/companybyservices/services", getByServices);

//!Preguntar al grupo si se quiere que users no registrados puedan buscar por nombre compañías
module.exports = CompanyRoutes;

const { isAuthAdmin } = require("../../middleware/auth.middleware");
const {
  createCompany,
  getByName,
  getById,
  getByServices,
  getAll,
  getByDescLikes,
  getByAscLikes,
  updateCompany,
  deleteCompany,
} = require("../controllers/Company.controllers");

const { upload } = require("../../middleware/files.middleware");
const CompanyRoutes = require("express").Router();

//! ---------------- endPoints sin auth ---------------------------------------

CompanyRoutes.get("/byName", getByName);
CompanyRoutes.get("/getall", getAll);
CompanyRoutes.get("/:id", getById);
CompanyRoutes.get("/companybyservices/services", getByServices);
CompanyRoutes.get("/getByDescLikes/likes", getByDescLikes);
CompanyRoutes.get("/getByAscLikes/likes", getByAscLikes);

//! ---------------- endPoints con auth ---------------------------------------
//* Si hacemos multi part necesitamos que en la ruta ponga upload.single(image)

CompanyRoutes.post(
  "/create",
  [isAuthAdmin],
  upload.single("image"),
  createCompany
);
CompanyRoutes.patch(
  "/update/:id",
  [isAuthAdmin],
  upload.single("image"),
  updateCompany
);
CompanyRoutes.delete("/:idCompany", [isAuthAdmin], deleteCompany);

module.exports = CompanyRoutes;

// Adición de comentarios junto a correcciones (no el código)

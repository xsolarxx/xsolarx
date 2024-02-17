//* Solo el admin puede crear y actualizar compañías

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
} = require("../controllers/Company.controllers");

const { upload } = require("../../middleware/files.middleware");

const CompanyRoutes = require("express").Router();

//* upload.single("image") y upload middleware --> Para subir img
CompanyRoutes.post(
  "/create",
  [isAuthAdmin],
  upload.single("image"),
  createCompany
);
CompanyRoutes.get("/byName", getByName);
CompanyRoutes.get("/getall", getAll);
CompanyRoutes.get("/:id", getById);
CompanyRoutes.get("/companybyservices/services", getByServices);
CompanyRoutes.get("/getByDescLikes", getByDescLikes);
CompanyRoutes.get("/getByAscLikes", getByAscLikes);
CompanyRoutes.patch("/update/:id", [isAuthAdmin], updateCompany);

module.exports = CompanyRoutes;

const { isAuthAdmin } = require("../../middleware/auth.middleware");
const { createCompany } = require("../controllers/Company.controllers");
const { upload } = require("../../middleware/files.middleware");

const CompanyRoutes = require("express").Router();

//* upload.single("image") y upload middleware para poder subir imagenes por media

CompanyRoutes.post("/create", [isAuthAdmin], upload.single("image"), createCompany);


module.exports = CompanyRoutes;
const { isAuthAdmin } = require("../../middleware/auth.middleware");
const {
  createNews,
  getAll,
  getById,
  update,
  getByTags,
  deleteNews
} = require("../controllers/News.controllers");
const { upload } = require("../../middleware/files.middleware");

const NewsRoutes = require("express").Router();
//! upload.single("image") y upload middleware para poder subir imagenes por media
NewsRoutes.post("/create", [isAuthAdmin], upload.single("image"), createNews);
NewsRoutes.get("/getall", getAll);
NewsRoutes.get("/getbyid/:id", getById);
NewsRoutes.get("/getbytags", getByTags);
NewsRoutes.patch("/update/:id", update);
NewsRoutes.delete("/:id", deleteNews);

// NewsRoutes.get("/getbyid/:id", getById);

module.exports = NewsRoutes;

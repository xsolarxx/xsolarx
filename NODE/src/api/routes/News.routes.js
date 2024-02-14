const { isAuthAdmin } = require("../../middleware/auth.middleware");
const { createNews } = require("../controllers/News.controllers");

const NewsRoutes = require("express").Router();

NewsRoutes.post("/create", [isAuthAdmin], createNews);
// NewsRoutes.get("/getbyid/:id", getById);

module.exports = NewsRoutes;

const User = require("../models/User.model");
const News = require("../models/News.model");
const Comment = require("../models/Comment.model");

const createNews = async (req, res, next) => {
  let catchImg = req.file?.path; 

  try {
    await News.syncIndexes(); // 
    const customBody = {
      title: req.body?.title,
      shortContent: req.body?.shortContent,
      fullContent: req.body?.fullContent,
      author: req.body?.author,
      tags: req.body?.tags, // pensar en funcion del enum
      image: req.file?.path,
      ownerAdmin: req.user._id,
     
    }
    const newNews = new News(customBody);
    const savedNews = await newNews.save(); // el await espera a que se resuelva la promesa 
    
    if(savedNews)
    {
    try {
    await User.findByIdAndUpdate(req.user._id,{
      $push : { newsOwnerAdmin : newNews._id,}
    })
    return res.status(200).json("El admin ha creado la noticia");
    } catch (error) {
      return res.status(404).json({
        error: "Se ha encontrado error catch al crear la noticia por el admin",
        message: error.message,
      });
      
    }
      
    }

  } catch (error) {
    return res.status(404).json ({
      error: "error catch create news",
      message: error.message,
    })
    
  }


  };

  // if (req.file) {
  //   newUser.image = req.file.path;
  // } else {
  //   newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
  // }

  module.exports = { createNews };

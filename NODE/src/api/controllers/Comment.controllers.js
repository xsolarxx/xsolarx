const User = require("../models/User.model");
const News = require("../models/News.model");
const Forum = require("../models/Forum.model");
const Company = require("../models/Company.model");
const Comment = require("../models/Comment.model");

// --------------------------------* CREATE COMMENT *--------------------------------------------------------------------

const createComment = async (req, res, next) => {
  try {
    const { idRecipient } = req.params;
    const findNews = await News.findById(idRecipient);
    const findForum = await Forum.findById(idRecipient);
    const findCompany = await Company.findById(idRecipient);

    if (findNews) {
      // Ruta autenticada para users registrados. Por eso se pone req.user que lo coge de middleware
      const newComment = new Comment({
        ...req.body,
        owner: req.user._id,
        recipientNews: findNews,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await News.findByIdAndUpdate(idRecipient, {
            // Actualiza el array de comentarios en News
            $push: { comments: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "Error actualizando la noticia y el usuario",
            message: error.message,
          }) && next(error);
        }
      }
    }
    if (findForum) {
      const newComment = new Comment({
        ...req.body,
        owner: req.user?._id,
        recipientForum: findForum,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await Forum.findByIdAndUpdate(idRecipient, {
            // Actualiza el array de comentarios en Forum
            $push: { comments: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "Error actualizando el foro y el usuario",
            message: error.message,
          }) && next(error);
        }
      }
    }
    if (findCompany) {
      const newComment = new Comment({
        ...req.body,
        owner: req.user._id,
        recipientCompany: findCompany,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await Company.findByIdAndUpdate(idRecipient, {
            // Actualiza el array de comentarios en Forum
            // userCompanyReviews --> Clave de Company model que representa comments
            $push: { userCompanyReviews: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "Error actualizando la compañía y el usuario",
            message: error.message,
          }) && next(error);
        }
      }
    }
  } catch (error) {
    res.status(404).json({
      error: "Error general al crear comentario en la noticia, foro o compañía",
      message: error.message,
    }) && next(error);
  }
};

//--------------------------------* GET BY ID *--------------------------------------------------------------------

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id);
    if (commentById) {
      return res.status(200).json(commentById);
    } else {
      return res.status(404).json("No se ha encontrado el comentario");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

// ------------------------------* GET BY ALL *-------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allComments = await Comment.find();
    if (allComments.length > 0) {
      return res.status(200).json(allComments);
    } else {
      return res.status(404).json("No se encontraron los comentarios");
    }
  } catch (error) {
    return res.status(404).json({
      error: "Error en la búsqueda. Lanzado en el catch",
      message: error.message,
    });
  }
};

//-----------------------------------* UPDATE *-------------------------------------------

const update = async (req, res, next) => {
  await Comment.syncIndexes();
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id);
    if (commentById) {
      const customBody = {
        _id: commentById._id,
        content: req.body?.content ? req.body?.content : commentById.content,
        title: req.body?.title ? req.body?.title : commentById.title,
      };

      try {
        await Comment.findByIdAndUpdate(id, customBody);

        //-----------------------* Test *--------------------------------------------------------
        //Se busca el elemento actualizado vía id.
        const commentByIdUpdate = await Comment.findById(id);

        // Se sacan las claves del req.body para saber qué elementos actualizar
        const elementUpdate = Object.keys(req.body);
        let test = {};

        // Se recorren las claves del body y se crea un objeto con los test
        elementUpdate.forEach((item) => {
          if (req.body[item] === commentByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

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
      return res.status(404).json("Este comentario no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

// ------------------------------* DELETE COMMENT *-------------------------------------------------------

const deleteComment = async (req, res, next) => {
  try {
    const { idComment } = req.params;

    // Elimina el comentario
    await Comment.findByIdAndDelete(idComment);
    console.log("ID del comentario eliminado:", idComment);
    // Actualiza las referencias de los modelos de datos
    await Promise.all([
      User.updateMany(
        { favComments: idComment },
        { $pull: { favComments: idComment } }
      ),
      Comment.updateOne(
        { likes: idComment },
        { $pull: { likes: idComment } } // Elimina id del comentario de la lista de likes
      ),
      News.updateOne(
        { comments: idComment },
        { $pull: { comments: idComment } }
      ),
      Company.updateOne(
        { userCompanyReviews: idComment },
        { $pull: { userCompanyReviews: idComment } }
      ),
      Forum.updateOne(
        { comments: idComment },
        { $pull: { comments: idComment } }
      ),
    ]);

    return res
      .status(200)
      .json({ message: "Comentario eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({
      error: "Error eliminando el comentario",
      message: error.message,
    });
  }
};

// ------------------------------* GET BY  *------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
module.exports = {
  createComment,
  getAll,
  getById,
  update,
  deleteComment,
};

//Ok

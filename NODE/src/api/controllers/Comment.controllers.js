const User = require("../models/User.model");
const News = require("../models/News.model");
const Forum = require("../models/Forum.model");
const Company = require("../models/Company.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const createComment = async (req, res, next) => {
  try {
    const { idRecipient } = req.params;
    const findNews = await News.findById(idRecipient);
    const findForum = await Forum.findById(idRecipient);
    const findCompany = await Company.findById(idRecipient);

    if (findNews) {
      //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
      const newComment = new Comment({
        ...req.body,
        owner: req.user._id,
        recipientNews: findNews,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await News.findByIdAndUpdate(idRecipient, {
            //*estamos actualizando el array de comentarios en noticias
            $push: { comments: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "error update news and user",
            message: error.message,
          }) && next(error);
        }
      }
    }
    if (findForum) {
      console.log(req.user);
      //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
      const newComment = new Comment({
        ...req.body,
        owner: req.user?._id,
        recipientForum: findForum,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await Forum.findByIdAndUpdate(idRecipient, {
            //*estamos actualizando el array de comentarios en el foro
            $push: { comments: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "error update news and user",
            message: error.message,
          }) && next(error);
        }
      }
    }
    if (findCompany) {
      //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
      const newComment = new Comment({
        ...req.body,
        owner: req.user._id,
        //* corregiod de recipientCompanies a recipientCompany, error detectado testando en insomnia 17 feb
        recipientCompany: findCompany,
      });
      const saveComment = await newComment.save();
      if (saveComment) {
        try {
          await Company.findByIdAndUpdate(idRecipient, {
            //*estamos actualizando el array de comentarios en company
            //* Company model no tienen ninguna clave que se llame "comments", sino "userCompanyReviews", corregiod por Ines
            $push: { userCompanyReviews: newComment._id },
          });
          await User.findByIdAndUpdate(req.user._id, {
            $push: { comments: newComment._id },
          });
          return res.status(200).json({ create: true, saveComment });
        } catch (error) {
          res.status(404).json({
            error: "error update company and user",
            message: error.message,
          }) && next(error);
        }
      }
    }
  } catch (error) {
    res.status(404).json({
      error: "error general al crear comentario en noticia, foro o compañia",
      message: error.message,
    }) && next(error);
  }
};

// ) GET BY ID

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

//) DELETE COMMENT
//! en progreso
const deleteComment = async (req, res, next) => {
  try {
    const { idComment } = req.params;
    const newsCommentExist = await News.findById(idComment);
    const companyCommentExist = await Company.findById(idComment);
    const forumCommentExist = await Forum.findById(idComment);

    if (newsCommentExist) {
      await News.findByIdAndDelete(idComment);
      const newsCommentDelete = await News.findById(idComment);
      if (!newsCommentExist) {
        try {
          await News.updateMany(
            { comments: idComment },
            { $pull: { comments: idComment } }
          );
        } catch (error) {}
      }
    }
  } catch (error) {}
};

// ------------------------------ GET BY ALL-------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const allComment = await Comment.find();
    /** el find nos devuelve un array */
    if (allComment.length > 0) {
      return res.status(200).json(allComment);
    } else {
      return res.status(404).json("No se han encontrado comentarios");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ UPDATE-----------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const update = async (req, res, next) => {
  await Comment.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const commentById = await Comment.findById(id);
    if (commentById) {
      const oldImg = commentById.image;

      const customBody = {
        _id: commentById._id,
        image: req.file?.path ? catchImg : oldImg,
        title: req.body?.title ? req.body?.title : commentById.title,
      };

      try {
        await Comment.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }

        //** ------------------------------------------------------------------- */
        //** VAMOS A TESTEAR EN TIEMPO REAL QUE ESTO SE HAYA HECHO CORRECTAMENTE */
        //** ------------------------------------------------------------------- */

        // ......> VAMOS A BUSCAR EL ELEMENTO ACTUALIZADO POR ID

        const commentByIdUpdate = await Comment.findById(id);

        // ......> me cojer el req.body y vamos a sacarle las claves para saber que elementos nos ha dicho de actualizar
        const elementUpdate = Object.keys(req.body);

        /** vamos a hacer un objeto vacion donde meteremos los test */

        let test = {};

        /** vamos a recorrer las claves del body y vamos a crear un objeto con los test */

        elementUpdate.forEach((item) => {
          if (req.body[item] === commentByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          characterByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }

        /** vamos a ver que no haya ningun false. Si hay un false lanzamos un 404,
         * si no hay ningun false entonces lanzamos un 200 porque todo esta correcte
         */

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
      return res.status(404).json("este comentario no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

module.exports = {
  deleteComment,
  createComment,
  getAll,
  getById,
  update,
};

const User = require("../models/User.model");
const News = require("../models/News.model")
const Forum = require("../models/Forum.model")
const Company = require("../models/Company.model")
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const CommentRoutes = require("../routes/Comment.routes");

const createComment = async (req, res, next) => {
try{
  const {idRecipient} = req.params
  const findNews = await News.findById (idRecipient) 
  const findForum = await Forum.findById (idRecipient) 
  const findCompany = await Company.findById (idRecipient) 
  if(findNews)
  {
    //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
    const newComment = new Comment({...req.body,owner:req.user._id,recipientNews:findNews})
    const saveComment = await newComment.save()
    if(saveComment){
     try {
      await News.findByIdAndUpdate(idRecipient, {
        //*estamos actualizando el array de comentarios en noticias
        $push: { comments: newComment._id },
      });
      await User.findByIdAndUpdate(req.user._id,{
        $push: { comments: newComment._id },
      });
      return res.status(200).json({create:true,saveComment});
     } catch (error) {
      res.status(404).json({
        error: "error update news and user",
        message: error.message,
      }) && next(error);
      }}

  }
  if(findForum)
  {
    //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
    const newComment = new Comment({...req.body,owner:req.user._id,recipientForum:findForum})
    const saveComment = await newComment.save()
    if(saveComment){
     try {
      await Forum.findByIdAndUpdate(idRecipient, {
        //*estamos actualizando el array de comentarios en el foro
        $push: { comments: newComment._id },
      });
      await User.findByIdAndUpdate(req.user._id,{
        $push: { comments: newComment._id },
      });
      return res.status(200).json({create:true,saveComment});
     } catch (error) {
      res.status(404).json({
        error: "error update news and user",
        message: error.message,
      }) && next(error);
      }
      }}
  if(findCompany)
  {
    //*ruta autenticada, no cualquier ususario puede hacer un comentario, por eso ponemos req.user que lo coge de middleware
    const newComment = new Comment({...req.body,owner:req.user._id,recipientCompanies:findCompany})
    const saveComment = await newComment.save()
    if(saveComment){
     try {
      await Company.findByIdAndUpdate(idRecipient, {
        //*estamos actualizando el array de comentarios en noticias
        $push: { comments: newComment._id },
      });
      await User.findByIdAndUpdate(req.user._id,{
        $push: { comments: newComment._id },
      });
      return res.status(200).json({create:true,saveComment});
     } catch (error) {
      res.status(404).json({
        error: "error update news and user",
        message: error.message,
      }) && next(error);
      }
      }}}
catch(error){
  res.status(404).json({
    error: "error crear comentario en news,foro and noticas",
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

//) DELETE COMMENT //!PREGUNTAR A LAURA

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (comment) {
      // Realiza una búsqueda para confirmar si aún sigue existiendo
      const finByIdComment = await Comment.findById(id);

      try {
        //updateMany actualizará varios elementos del Comment
        const test = await Comment.updateMany(
          { comment: id }, //filtra por id
          { $pull: { comment: id } }
        );
        console.log(test);

        try {
          await User.updateMany(
            { commentFav: id },
            { $pull: { commentFav: id } }
          );

          return res.status(finByIdComment ? 404 : 200).json({
            deleteTest: finByIdComment ? false : true,
          });
        } catch (error) {
          return res.status(404).json({
            error: "error catch update User", //!queda actualizar el error.
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: "error catch update Movi", //!queda actualizar este error.
          message: error.message,
        });
      }
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ GET BY ALL-------------------------------------------------------
//-------------------------------------------------------------------------------------------------
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

      if (req.body?.gender) {
        const resultEnum = enumOk(req.body?.gender);
        customBody.gender = resultEnum.check
          ? req.body?.gender
          : characterById.gender;
      }

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

module.exports = { deleteComment, createComment, getAll, getById, update };

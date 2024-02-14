const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

const createComment = async (req, res, next) => {
  try {
    await Comment.syncIndexes();

    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.body?.owner,
      recipientNews: req.body?.recipientNews,
      recipientForum: req.body?.recipientForum,
      recipientCompany: req.body?.recipientCompany,
    };
    const newComment = new Comment(customBody);
    const savedComment = await newComment.save();

    // PREGUNTA: teneis que actualizar las claves (try and catch)
    //Hace 3 try catch de cada uno de:
    /// ---> news: hay que actualizar el array  de comentarios con el id del comentario creado en el array comments
    /// ---> forum: comments hay que modificarlo en el modelo de forum
    /// ---> empresa:

    // test en el runtime
    return res
      .status(savedComment ? 200 : 404)
      .json(savedComment ? savedComment : "Error al crear el comentario");
  } catch (error) {
    return res.status(404).json({
      error: "Error tipo catch al crear comentario",
      message: error.message,
    });
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

const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

//-------------------------------------------------------------------------------------------------
// ------------------------------ CREAR POST/FORUM-------------------------------------------------
//-------------------------------------------------------------------------------------------------
const createForum = async (req, res, next) => {
  try {
    await Forum.syncIndexes();

    /** hacemos una instancia del modelo  */
    const customBody = {
      title: req.body?.title,
      content: req.body?.content,
      owner: req.body?.owner,
    };
    const newForum = new Forum(customBody);
    const savedForum = await newForum.save();

    // test en el runtime
    return res
      .status(savedForum ? 200 : 404)
      .json(savedForum ? savedForum : "error al crear el post");
  } catch (error) {
    return res.status(404).json({
      error: "error catch create post",
      message: error.message,
    });
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------ GET BY ID--------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forumtById = await Forum.findById(id);
    if (forumtById) {
      return res.status(200).json(forumtById);
    } else {
      return res.status(404).json("no se ha encontrado el post");
    }
  } catch (error) {
    return res.status(404).json(error.message);
  }
};
//-------------------------------------------------------------------------------------------------
// ------------------------------GET BY ALl-----------------------------------------------
//-------------------------------------------------------------------------------------------------
const getAll = async (req, res, next) => {
  try {
    const allForum = await Forum.find();
    /** el find nos devuelve un array */
    if (allForum.length > 0) {
      return res.status(200).json(allForum);
    } else {
      return res.status(404).json("no se han encontrado los post");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar - lanzado en el catch",
      message: error.message,
    });
  }
};

//-------------------------------------------------------------------------------------------------
// ------------------------------ DELETAR POST/FORUM-----------------------------------------------
//-------------------------------------------------------------------------------------------------
//! ver con el equipo
const deleteComment = async (req, res, next) => {
  try {
    // Extrai o ID do comentário dos parâmetros da solicitação HTTP
    const { id } = req.params;

    // Validação básica do ID
    if (!id) {
      return res.status(400).json({ error: "ID do comentário não fornecido" });
    }

    // Exclui o comentário pelo ID fornecido
    const comment = await Comment.findByIdAndDelete(id);

    // Verifica se o comentário foi excluído com sucesso
    if (!comment) {
      return res.status(404).json({ error: "Comentário não encontrado" });
    }

    // Remove referências do comentário em outras coleções
    await Promise.all([
      User.updateMany({ commentFav: id }, { $pull: { commentFav: id } }),
      Movie.updateMany({ comment: id }, { $pull: { comment: id } }),
    ]);

    // Retorna uma resposta indicando o sucesso da exclusão
    return res
      .status(200)
      .json({ success: true, message: "Comentário excluído com sucesso" });
  } catch (error) {
    // Trata os erros de forma mais detalhada
    return res
      .status(500)
      .json({ error: "Erro ao excluir o comentário", message: error.message });
  }
};
module.exports = { createForum, getById };

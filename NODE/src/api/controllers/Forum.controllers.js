const User = require("../models/User.model");
const Forum = require("../models/Forum.model");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");

// crear post
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

module.exports = { createForum };

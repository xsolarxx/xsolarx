const User = require("../models/User.model");
const Comment = require("../models/Comment.model");
const Chat = require("../models/Chat.model");


//! -----------------------------------------------------------------------------
//? ----------------------------CREATE-------------------------------------------
//! -----------------------------------------------------------------------------
const createChat = async (req, res, next) => {
  try {
    console.log(req.body.referenceOfferComment);
    const { userOne, userTwo } = req.body;

    const chatExistOne = await User.findOne({ userOne, userTwo });

    const chatExistTwo = await User.findOne({
      userOne: userTwo,
      userTwo: userOne,
    });

    if (!chatExistOne && !chatExistTwo) {
      const newChat = new Chat(req.body);
      try {
        await newChat.save();
        const findNewChat = await Chat.findById(newChat._id);
        if (findNewChat) {
          try {
            const userOneFind = await User.findById(userOne);

            await userOneFind.updateOne({
              $push: { chats: newChat._id },
            });

            try {
              const userTwoFind = await User.findById(userTwo);
              await userTwoFind.updateOne({
                $push: { chats: newChat._id },
              });
              return res.status(200).json({
                ChatSave: true,
                chat: await Chat.findById(newChat._id),
                userOneUpdate: await User.findById(userOne),
                userTwoUpdate: await User.findById(userTwo),
              });
            } catch (error) {
              return res.status(404).json("Dont update userTwo");
            }
          } catch (error) {
            return res.status(404).json("Dont update userOne");
          }
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      return res.status(404).json({ ChatExist: true });
    }
  } catch (error) {
    return next(error);
  }
};

// //! -----------------------------------------------------------------------------
// //? -----------------------------CREATE NEW COMMENT -----------------------------
// //! -----------------------------------------------------------------------------
// //?------------------------------------------------------------------------------

const newComment = async (req, res, next) => {
  try {
    try {
      const commentBody = {
        commentContent: req.body.commentContent,
        owner: req.user._id,
        commentType: "Privado",
        referenceUser: req.body.referenceUser,
        referenceOfferComment: req.body.referenceOfferComment,
      };
      const newComment = new Comment(commentBody);
      try {
        const savedComment = await newComment.save();

        if (savedComment) {
          try {
            await User.findByIdAndUpdate(req.user._id, {
              $push: { commentsByMe: newComment._id },
            });
            try {
              if (req.body.referenceOfferComment) {
                console.log("entro en la 91");
                await Offer.findByIdAndUpdate(req.body.referenceOfferComment, {
                  $push: { comments: newComment._id },
                });
                try {
                  const userReal = await Offer.findById(
                    req.body.referenceOfferComment
                  ).populate("owner");
                  await User.findByIdAndUpdate(userReal.owner[0]._id, {
                    $push: { commentsByOthers: newComment._id },
                  });

                  const userOne = req.user._id;
                  const userTwo = req.body.referenceUser
                    ? req.body.referenceUser
                    : userReal.owner[0]._id;

                  const chatExistOne = await Chat.findOne({
                    userOne: req.user._id,
                    userTwo: req.body.referenceUser
                      ? req.body.referenceUser
                      : userReal.owner[0]._id,
                  });
                  console.log();
                  const chatExistTwo = await Chat.findOne({
                    userTwo: req.user._id,
                    userOne: req.body.referenceUser
                      ? req.body.referenceUser
                      : userReal.owner[0]._id,
                  });

                  console.log(chatExistOne);
                  console.log(chatExistTwo);

                  if (!chatExistOne && !chatExistTwo) {
                    console.log("ENTRO POR EL IF");
                    console.log({ userOne, userTwo });
                    const newChat = new Chat({ userOne, userTwo });
                    newChat.menssages = [newComment._id];
                    try {
                      await newChat.save();
                      const findNewChat = await Chat.findById(newChat._id);
                      if (findNewChat) {
                        try {
                          await User.findByIdAndUpdate(userOne, {
                            $push: { chats: newChat._id },
                          });

                          try {
                            await User.findByIdAndUpdate(userTwo, {
                              $push: { chats: newChat._id },
                            });
                            return res.status(200).json({
                              ChatSave: true,
                              chat: await Chat.findById(newChat._id),
                              userOneUpdate: await User.findById(userOne),
                              userTwoUpdate: await User.findById(userTwo),
                              newComment: await Comment.findById(
                                savedComment._id
                              ),
                            });
                          } catch (error) {
                            return res.status(404).json("Dont update userTwo");
                          }
                        } catch (error) {
                          return res.status(404).json("Dont update userOne");
                        }
                      }
                    } catch (error) {
                      console.log("entro en el error ");
                      return res.status(404).json(error.message);
                    }
                  } else {
                    console.log("entro abajo");
                    try {
                      await Chat.findByIdAndUpdate(
                        chatExistOne ? chatExistOne._id : chatExistTwo._id,
                        { $push: { menssages: newComment.id } }
                      );
                      return res.status(200).json({
                        ChatExist: true,
                        newComment: await Comment.findById(savedComment._id),
                        chatUpdate: await Chat.findById(
                          chatExistOne ? chatExistOne._id : chatExistTwo._id
                        ),
                      });
                    } catch (error) {
                      return res.status(404).json("error update chat");
                    }
                  }
                } catch (error) {
                  return next(error);
                }
              } else {
                try {
                  if (req.body.referenceUser) {
                    await User.findByIdAndUpdate(req.body.referenceUser, {
                      $push: { commentsByOthers: newComment._id },
                    });
                    try {
                      const userOne = req.user._id;
                      const userTwo = req.body.referenceUser;
                      // const userTwo = req.body.referenceUser
                      //   ? req.body.referenceUser
                      //   : userReal.owner[0]._id;

                      const chatExistOne = await Chat.findOne({
                        userOne,
                        userTwo,
                      });

                      const chatExistTwo = await Chat.findOne({
                        userOne: userTwo,
                        userTwo: userOne,
                      });

                      if (!chatExistOne && !chatExistTwo) {
                        const newChat = new Chat({ userOne, userTwo });
                        newChat.menssages.push(newComment._id);
                        try {
                          await newChat.save();
                          const findNewChat = await Chat.findById(newChat._id);
                          if (findNewChat) {
                            try {
                              await User.findByIdAndUpdate(userOne, {
                                $push: { chats: newChat._id },
                              });

                              try {
                                await User.findByIdAndUpdate(userTwo, {
                                  $push: { chats: newChat._id },
                                });
                                return res.status(200).json({
                                  ChatSave: true,
                                  chat: await Chat.findById(newChat._id),
                                  userOneUpdate: await User.findById(userOne),
                                  userTwoUpdate: await User.findById(userTwo),
                                  newComment: await Comment.findById(
                                    savedComment._id
                                  ),
                                });
                              } catch (error) {
                                return res
                                  .status(404)
                                  .json("Dont update userTwo");
                              }
                            } catch (error) {
                              return res
                                .status(404)
                                .json("Dont update userOne");
                            }
                          }
                        } catch (error) {
                          return res.status(404).json(error.message);
                        }
                      } else {
                        try {
                          console.log("entro por push");
                          await Chat.findByIdAndUpdate(
                            chatExistOne ? chatExistOne._id : chatExistTwo._id,
                            { $push: { menssages: newComment.id } }
                          );
                          return res.status(200).json({
                            ChatExist: true,
                            newComment: await Comment.findById(
                              savedComment._id
                            ),
                            chatUpdate: await Chat.findById(
                              chatExistOne ? chatExistOne._id : chatExistTwo._id
                            ),
                          });
                        } catch (error) {
                          return res.status(404).json("error update chat");
                        }
                      }
                    } catch (error) {
                      return next(error);
                    }
                  }
                  module.exports = {
                    createChat,
                    newComment,
                  };
                
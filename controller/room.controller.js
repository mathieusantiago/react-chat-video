const RoomModel = require("../models/room.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.createRoom = async (req, res) => {
  console.log(req.id);
  const newRoom = new RoomModel({
    room: req.room,
    user: req.id,
  });
  try {
    const role = await newRoom.save();
    role;
    console.log("📄 room created");
  } catch (err) {
    console.log(err);

    console.log("❌ 📄 errors for the created room");
  }
};

module.exports.getAllRooms = async (req, res) => {
  const users = await RoomModel.find().sort({ updatedAt: "desc" });
  return users;
};

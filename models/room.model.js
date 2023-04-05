const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    user:{
        type: String,
        required: true,
      },
    
  },
  {
    timestamps: true,
  }
);

const RoomModel = mongoose.model("rooms", RoomSchema);

module.exports = RoomModel;

const mongoose = require("mongoose");
const User = require("./User");

const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  timeStrap: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;

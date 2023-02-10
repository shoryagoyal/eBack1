const mongoose = require("mongoose");
const User = require("./User");
const Image = require("./image");

const testSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  testDuration: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
    required: true,
  },
  candidateImages: [{}],
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;

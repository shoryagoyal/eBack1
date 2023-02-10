const mongoose = require("mongoose");
const Test = require("./Test");

const adminSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  // password: {
  //   type: String,
  //   required: true,
  // },
  // username: {
  //   type: String,
  //   required: true,
  // },
  testsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
  ],
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

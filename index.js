// Mongo db start command :- "C:\Program Files\MongoDB\Server\5.0\bin\mongo.exe"

// To-do
// 1) \; to introduce line break in text editor
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const cloudinary = require("cloudinary");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const dbUrl = "mongodb://localhost:27017/discussPortal"; //process.env.DB_URL; // 'mongodb://localhost:27017/discussPortal'; //process.env.DB_URL;
const port = process.env.PORT || 3000;
const cors = require("cors");
const fs = require("fs");
app.use(cors());

// const User = require("./models/user");
// const Admin = require("./models/admin");
// const Test = require("./models/test");
app.models = require("./models"); // Reference  https://stackoverflow.com/questions/14641834/how-to-get-rid-of-error-overwritemodelerror-cannot-overwrite-undefined-mode
const User = app.models("User");
const Admin = app.models("Admin");
const Test = app.models("Test");

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  dbName: "quizWebsite",
};
mongoose
  .connect(dbUrl, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

app.use(cookieParser());
// app.use(express.static(__dirname + '/public'));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.set("public", path.join(__dirname, "public"));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  expressSession({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.use((req, res, next) => {
  if (req.session.user) res.locals.user = req.session.user;
  next();
});

function getTime() {
  var d = new Date(); // for now
  return d.getHours() + " " + d.getMinutes();
}
app.get("/test/login", (Req, res) => {
  res.render("testLogin");
});

app.post("/test/login", async (req, res) => {
  const { name, email, testId } = JSON.parse(Object.keys(req.body)[0]);
  // If the person with same email already exit
  //   --Then compare test id if the test id is also same then user has already attempted the test
  //   --If the test id is different then user is giving a different test so allow user to complete test
  const newUser = new User({
    name: name,
    email: email,
    testId: testId,
  });
  const user = await newUser.save();
  console.log(user);
  res.locals.user = user;
  req.session.user = user;
  const newTest = new Test({
    candidate: req.session.user,
    testDuration: "90",
    testDate: new Date(),
    candidateImage: [],
  });
  const test = await newTest.save();
  req.session.testId = test._id;
  res.status(200).send("test created successfully");
});

app.get("/test/saveImages", (req, res) => {
  res.render("testWindow");
});
app.post(
  "/test/saveImage",
  upload.single("candidateImage"),
  async (req, res) => {
    if (!req.session.user || !req.session.testId)
      res.status(401).send("invalid request");
    else {
      try {
        const imageUrl = await cloudinary.v2.uploader.upload(req.file.path, {
          public_id: Date.now(),
          resource_type: "auto",
        });
        console.log(imageUrl);
        const test = await Test.findOne({ _id: req.session.testid });
        test.candidateImage.push(result.url);
        await test.save();
        res.status(200).send("image uploaded successfully");
      } catch (err) {
        res.status(500).send(err);
      }
    }
  }
);

app.get("/admin/register", (req, res) => {
  res.render("adminRegister");
});
app.post("/admin/register", async (req, res) => {
  const { name, username, password } = req.body;
  const newAdmin = new Admin({
    name: name,
    username: username,
    password: password,
  });
  const admin = await newAdmin.save();
  req.session.adminId = admin._id;
  res.redirect("/admin/dashBoard");
});

app.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username: username });
  console.log("user=" + admin);
  if (!admin || admin.password != password) {
    res.send("Invalid details entered");
    // res.render('user/login',{errorMessage});
  } else {
    req.session.adminId = admin._id;
    res.locals.adminId = admin._id;
    res.redirect("/admin/dashBoard");
  }
});

app.get("/admin/dashBoard", async (req, res) => {
  if (!req.session.adminId) res.send("Not allowed to view the resource");
  else {
    const adminData = await Admin.findOne({
      _id: req.session.adminId,
    }).populate("testList");
    const jsonContent = JSON.stringify(adminData);
    console.log(jsonContent);
    res.end(jsonContent);
  }
});

app.post("/random", (req, res) => {
  // console.log(req.body);
  let post = JSON.parse(Object.keys(req.body)[0]);
  console.log("jhdjk");
  var data = post.replace(/^data:image\/\w+;base64,/, "");
  var buf = Buffer.from(data, "base64");
  fs.writeFile("images/image.png", buf, function (err) {
    console.log("The file was saved!");
  });
});
// app.post("/test/:userEmail/");

app.listen(3000, () => {
  console.log("started");
});

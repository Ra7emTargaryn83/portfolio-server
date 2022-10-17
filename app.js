require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

//////////////////////mongo//////////////
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  thumbnail: String,
  title: String,
  link: String,
  imageNameInBucket: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

mongoose.connect(`${process.env.MONGO_LINK}`, {
  useNewUrlParser: true,
});

const Project = mongoose.model("Project", projectSchema);

////////////////////routes//////////

///// Upload to mongo ////

app.post("/upload", (req, res) => {
  const img = req.body.imgLocation;
  const title = req.body.titleName;
  const link = req.body.linkName;
  const ImageName = req.body.ImageName;

  try {
    const project = new Project({
      thumbnail: img,
      title: title,
      link: link,
      imageNameInBucket: ImageName,
    });

    project.save((err) => {
      if (err) console.log(err);
      else console.log("saved!");
    });
  } catch (err) {
    res.send("an error has occurd");
  }
});

////////projects page read:

app.get("/read", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const page_size = 6;
  totalPages = 0;

  //to know the total num of pages
  let total = Project.countDocuments({}, (err, docCount) => {
    if (err) {
      console.log(err);
    } else {
      totalPages = Math.ceil(docCount / page_size);
    }
  });

  const projects = await Project.find({})
    .limit(page_size)
    .sort({ date: -1 })
    .skip(page_size * page);

  res.json({
    total: totalPages,
    projects,
  });
});

/////////Delete ///////
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  Project.findByIdAndRemove(id, (err, data) => {
    if (err) console.log(err);
    else res.send(data);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is up and running");
});

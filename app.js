const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const campGround = require("./models/campground");
const methodOverride = require("method-override");
const exp = require("constants");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ThrowError = require("./utils/ThrowError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_"));
const validateCampground = (req, res, next) => {
  const result = campgroundSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new ThrowError(msg, 400);
  }
  next();
};
const validateReview = (req, res, next) => {
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(",");
    throw new ThrowError(msg, 400);
  }
  next();
};
//Get Requests
/*app.get("/", (req, res) => {
  res.render("home");
});*/
app.get(
  "/campgrounds",
  wrapAsync(async (req, res) => {
    const camps = await campGround.find({});
    res.render("campgrounds/index", { camps });
  })
);
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campGround.findById(id);
    res.render("campgrounds/show", { camp });
  })
);
app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campGround.findById(id);
    res.render("campgrounds/edit", { camp });
  })
);
// app.get("/makecampground", wrapAsync(async (req, res) => {
//   const camp = new campGround({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// }));
//POST Requests
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const camp = await campGround.findById(req.params.id);
    const review1 = new review(req.body.review);
    camp.reviews.push(review1);
    await review1.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);
app.post(
  "/campgrounds",
  validateCampground,
  wrapAsync(async (req, res) => {
    // if (!req.body.campground) {
    //   throw new ThrowError("Mandatory details not filled", 400);
    // }

    const newcamp = new campGround(req.body.campground);
    await newcamp.save();
    res.redirect(`/campgrounds/${newcamp._id}`);
  })
);

//PATCH Requests
app.patch(
  "/campgrounds/:id",
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await campGround.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
  })
);
//DELETE Requests
app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await campGround.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
  })
);

//ERROR HANDLING
app.all("*", (req, res, next) => {
  next(new ThrowError("Page not found", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh no something went wrong!";
  }

  res.status(statusCode).render("campgrounds/error", { err });
});
app.listen(3000, () => {
  console.log("Serving on port 3000");
});

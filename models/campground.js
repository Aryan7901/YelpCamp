const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campGroundSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  location: { type: String, required: true },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

module.exports = mongoose.model("campGround", campGroundSchema);

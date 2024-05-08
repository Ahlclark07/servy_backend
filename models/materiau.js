// models/materiau.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materiauSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  miniDescription: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  image: String,
});

const Materiau = mongoose.model("Materiau", materiauSchema);

module.exports = Materiau;

// models/service.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  categorie: {
    type: Schema.Types.ObjectId,
    ref: "CategorieDeService",
    required: true,
  },
  actif: {
    type: Boolean,
    default: true,
    required: true,
  },
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;

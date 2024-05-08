// models/categorieDeService.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorieDeServiceSchema = new Schema({
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: String,
  actif: {
    type: Boolean,
    default: true,
    required: true,
  },
});

const CategorieDeService = mongoose.model(
  "CategorieDeService",
  categorieDeServiceSchema
);

module.exports = CategorieDeService;

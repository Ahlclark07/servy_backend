// models/portefeuille.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portefeuilleSchema = new Schema({
  montant: {
    type: Number,
    required: true,
  },
  actif: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const Portefeuille = mongoose.model("Portefeuille", portefeuilleSchema);

module.exports = Portefeuille;

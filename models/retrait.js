// models/Retrait.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const retraitSchema = new Schema({
  montant: {
    type: Number,
    required: true,
  },
  vendeur: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  etat: {
    type: String,
    enum: ["En attente", "refusé", "accepté"],
    default: "En attente",
    required: true,
  },
  message: {
    type: String,
    default: "Veuillez patienter",
  },
});

const Retrait = mongoose.model("Retrait", retraitSchema);

module.exports = Retrait;

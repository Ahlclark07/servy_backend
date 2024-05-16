// models/servicePrestataire.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const servicePrestataireSchema = new Schema({
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  vendeur: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: String,
  images: [String],
  vocal: String,
  materiaux: [
    {
      type: Schema.Types.ObjectId,
      ref: "Materiau",
    },
  ],
  tarif: {
    type: Number,
    required: true,
  },

  actif: {
    type: Boolean,
    default: true,
    required: true,
  },
  verifie: {
    type: Boolean,
    default: false,
    required: true,
  },
  delai: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
  },
});

const ServicePrestataire = mongoose.model(
  "ServicePrestataire",
  servicePrestataireSchema
);

module.exports = ServicePrestataire;

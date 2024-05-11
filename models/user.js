const { Int32 } = require("mongodb");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { formatDate } = require("../utils/usefulFunctions");

const roles = ["client", "vendeur", "vendeur pro"];
// Définition du schéma utilisateur
const userSchema = new mongoose.Schema({
  idFirebase: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: roles,
    required: true,
  },
  actif: {
    required: true,
    default: true,
    type: Boolean,
  },
  enTransition: {
    type: Boolean,
    required: true,
    default: false,
  },
  nom: {
    type: String,
    required: true,
  },
  prenoms: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  telephone: {
    type: Number,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  carteIdentite: {
    type: String,
  },
  photoDeProfil: {
    type: String,
  },
  profession: {
    type: String,
  },
  attestationProfession: {
    type: String,
  },
  dateDeNaissance: {
    type: Date,
    required: true,
  },
  portefeuille: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portefeuille",
  },
  adresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "adresse" }],
});

// Création du modèle utilisateur
userSchema.plugin(uniqueValidator);
userSchema.virtual("nom_complet").get(function () {
  return this.nom + " " + this.prenoms;
});

userSchema.virtual("date_de_naissance").get(function () {
  try {
    return formatDate(this.dateDeNaissance);
  } catch (error) {
    console.log(error);
  }
});
userSchema.virtual("date_de_creation").get(function () {
  try {
    return formatDate(this.createdAt);
  } catch (error) {
    console.log(error);
  }
});
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });
const User = mongoose.model("User", userSchema);

module.exports = User;

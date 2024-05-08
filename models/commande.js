const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Référence au modèle User pour le client
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServicePrestataire",
    required: true,
  },
  statut: {
    type: String,
    enum: ["non_payer", "en_attente", "en_cours", "terminee", "annulee"], // Exemples de statuts possibles
    default: "non_payer",
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  dateDebut: {
    type: Date,
  },
  dateFinReelle: {
    type: Date,
  },
  evaluation: {
    type: Number,
  },
});

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = Commande;

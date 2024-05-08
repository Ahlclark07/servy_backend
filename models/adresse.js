const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adresseSchema = new Schema({
  departement: {
    type: String,
    required: true,
  },
  ville: {
    type: String,
    required: true,
  },
  quartier: {
    type: String,
    required: true,
  },
  localisationMap: {
    type: String, // Stockez les coordonnées de localisation ou utilisez un type de données de localisation approprié
    required: true,
  },
  informations: {
    type: String,
    required: true,
  },
});
adresseSchema.virtual("show_address").get(function () {
  return `${this.departement}, ${this.ville}, ${this.quartier} (${this.informations}) `;
});

adresseSchema.set("toObject", { virtuals: true });
adresseSchema.set("toJSON", { virtuals: true });
const adresseModel = mongoose.model("adresse", adresseSchema);

module.exports = adresseModel;

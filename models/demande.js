const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const demandeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  status: {
    type: String,
    enum: ["en attente", "acceptée", "refusée"],
    default: "en attente",
  },
  message: {
    type: String,
    default:
      "Veuillez patienter le temps que la modération examine votre demande.",
  },
});
demandeSchema.virtual("show_message").get(function () {
  let message = `Votre demande est ${this.status}. `;
  switch (this.status) {
    case "en attente":
      message += "Vous devez patienter le temps que la modération l'examine";
      break;
    case "refusée":
      message += this.message;
      break;
    default:
      break;
  }
  return message;
});

demandeSchema.set("toObject", { virtuals: true });
demandeSchema.set("toJSON", { virtuals: true });
const demandeModel = mongoose.model("demande", demandeSchema);

module.exports = demandeModel;

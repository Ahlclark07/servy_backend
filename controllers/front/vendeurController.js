const Portefeuille = require("../../models/portefeuille");
const Service = require("../../models/Service");
const Commande = require("../../models/commande");
const ServicePrestataire = require("../../models/servicePrestataire");
const User = require("../../models/user");
const { getCurrentUser } = require("../../utils/getCurrentUser");
const Materiau = require("../../models/Materiau");
const Demande = require("../../models/demande");
const { path } = require("app-root-path");
const Retrait = require("../../models/retrait");
exports.becomeSeller = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req);

    if (user.role === "client") {
      if (req.files["carteidentite"] && req.files["photodeprofil"]) {
        user.carteIdentite = req.files["carteidentite"][0].filename;
        user.photoDeProfil = req.files["photodeprofil"][0].filename;
        user.profession = req.body.profession;
        user.enTransition = true;
        const demande = await Demande.create({ user: user._id });
      } else {
        throw new Error("Aucun fichier trouvé");
      }
      await user.save();

      res.status(201).json({
        message: "Carte d'identité ajoutée avec succès. Attendez la modération",
      });
    } else {
      res.status(404).json({
        message: "Vous n'êtes pas autorisé",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.becomeProSeller = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req);
    if (user.role === "vendeur" || user.role === "vendeur pro") {
      if (req.files["attestationProfession"]) {
        user.attestationProfession =
          req.files["attestationProfession"][0].filename;
        user.profession = req.body.profession;
        user.enTransition = true;
        const demande = await Demande.create({ user: user._id });
      } else {
        throw new Error("Attestation non trouvé");
      }
      await user.save();

      res.status(201).json({
        message: "Document reçu. Attendez la modération",
      });
    } else {
      res.status(401).json({
        message: "Vous n'êtes pas autorisé",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMateriel = async (req, res) => {
  try {
    const materiel = await Materiau.findOne({ nom: req.body.nom });
    req.body.image = req.file.filename;
    if (materiel) throw new Error("Existe déjà");
    const nouveauMateriel = await Materiau.create(req.body);
    res.status(201).json(nouveauMateriel);
  } catch (error) {
    res.status(400).json({ message: error.message, provided: req.body });
  }
};
exports.deleteMateriel = async (req, res) => {
  try {
    const materiel = await Materiau.findByIdAndDelete(req.body.id);
    const imagePath = materiel.image; // Supposons que l'image soit stockée dans la propriété "image"

    fs.unlinkSync(
      appRoot + "/public/uploads/images/materiaux/" + imagePath,
      function (err) {
        if (err) throw err;
        console.log("File deleted!");
      }
    );

    if (!materiel) {
      return res
        .status(404)
        .json({ message: "Matériel de service non trouvée" });
    }

    res.status(200).json({ message: "Matériel supprimé avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.createServicePrestataire = async (req, res) => {
  try {
    const vendeur = req.user;
    console.log(vendeur);
    if (vendeur.role != "vendeur" && vendeur.role != "vendeur pro")
      return res
        .status(400)
        .json({ message: "Vous n'êtes pas un vendeur", user: vendeur });

    const service = await Service.findById(req.body.service);

    if (!service) throw new Error("Le service n'existe pas.");
    req.body.vendeur = vendeur._id;
    req.body.images = [];
    for (file of req.files) {
      if (file.fieldname == "images") {
        req.body.images.push(file.filename);
      } else if (file.fieldname == "audio") {
        req.body.audio = file.filename;
      }
    }
    req.body.actif = req.body.verifie = false;

    req.body.messageAdmin =
      "Patientez pendant que la modération examine votre service";
    const servicePrestaire = await ServicePrestataire.create(req.body);
    return res.status(201).json(servicePrestaire);
  } catch (error) {
    res.status(400).json({ message: error.message, provided: req.body });
  }
};

exports.updateServiceState = async (req, res) => {
  try {
    const service = await ServicePrestataire.findById(req.params.id);
    if (!service) {
      return res
        .status(404)
        .json({ message: "Service non valide à cette action" });
    }
    if (!service.verifie) {
      return res
        .status(401)
        .json({ message: "Service non valide à cette action" });
    }
    await service.updateOne({ actif: !service.actif });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Méthode pour mettre à jour un service
exports.updateService = async (req, res) => {
  try {
    req.body.image = req.file.filename;
    const service = await Service.findByIdAndUpdate(req.body.id, req.body, {
      new: true,
    });
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.makeRetrait = async (req, res) => {
  try {
    const montant = req.body.montant;
    const user = await req.user.populate("portefeuille");

    if (user.role == "client" || montant > user.portefeuille.montant)
      return res
        .status(404)
        .json({ message: "Vous ne pouvez pas effectuer ce retrait" });

    const retrait_existant = await Retrait.find({
      etat: "En attente",
      vendeur: user,
    });
    if (retrait_existant)
      return res
        .status(401)
        .json({ message: "Vous avez déjà une demande de retrait en attente" });
    const retrait = await Retrait.create({ vendeur: user, montant: montant });
    res.status(201).json(retrait);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.listOrder = async (req, res, next) => {
  try {
    user=req.user
    listCommande=[]
    if(user.role ==='client' )
      throw new error("Acccès interdit")
    else
      listCommande= await Commande.find().populate({
        path:"service",
        match : {vendeur: user._id}
      })
      listCommande= listCommande.filter(commande => commande.service !== null);
      res.send(listCommande)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listOrderByStatus = async (req, res, next) => {
  try {
    user=req.user;
    listCommande=[]
    if(user.role === 'client')
      throw new error("Accès interdit")
    else
      listCommande= await Commande.find({'statut' : req.params.statut }).populate({
        path:"service",
        match : {vendeur: user._id}
      })
      listCommande= listCommande.filter(commande => commande.service !== null);
      res.send(listCommande)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.validateOrder = async (req, res, next) => {
  try {
    user=req.user;
    if(user.role === 'client'){
      throw new Error("Accès interdit");
    }
    commande = await Commande.findOne({'_id': req.params.id}).populate("service")
    console.log(typeof commande.service.vendeur)
    console.log(typeof user._id)
    if(String(commande.service.vendeur) == String(user._id)){
      await commande.updateOne({statut: "en_cours"})
      res.status(201).send("Commande validée")
    }
    else{
      throw new Error("Accès interdit ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    user=req.user;
    commande = await Commande.findOne({'_id': req.params.id}).populate({
      path: "service",
      populate: {
        path: "vendeur",
        populate: {
          path: "portefeuille",
        }
      }
    })
    if(String(commande.service.vendeur._id) == String(user._id)){
      await commande.updateOne({statut: "annulee"})
      commande.service.vendeur.portefeuille.montantEnAttente -= (commande.service.tarif * 0.9);
  
      await commande.service.vendeur.portefeuille.save();
      res.status(201).send("Commande annulée")
    }
    else{
      throw new Error("Accès interdit ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.endOrderRequest = async (req, res, next) => {
  try {
    user=req.user;
    
    commande = await Commande.findOne({'_id': req.params.id})

    commande = await Commande.findOne({'_id': req.params.id}).populate("service")
    if(String(commande.service.vendeur) == String(user._id)){
      commande.demandeValidation= true;
      await commande.save();
      res.send(commande)
    }
    else{
      throw new Error("Accès interdit ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
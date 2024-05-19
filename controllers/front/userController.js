const User = require("../../models/user");
const Commande = require("../../models/commande");

const admin = require("../../config/firebase-config");
const { getCurrentUser } = require("../../utils/getCurrentUser");
const FcmToken = require("../../models/fcmToken.js");
const ServicePrestataire = require("../../models/servicePrestataire");
const Service = require("../../models/service");
const { FedaPay, Transaction } = require("fedapay");

const fs = require("fs");
exports.userRole = async (req, res, next) => {
  try {
    const user = req.user;

    if (user) {
      if (!user.photoDeProfil) user.photoDeProfil = "user.jpg";
      res.status(200).json({ user: user });
    } else
      res.status(404).json({ message: "Utilisateur non inscrit dans servy" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.servicesList = async (req, res, next) => {
  try {
    const services = await Service.find({});
    res.status(200).json({ services: services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.ServicePrestataireList = async (req, res, next) => {
  try {
    const services = await ServicePrestataire.find({})
      .limit(10)
      .populate("vendeur", "nom photoDeProfil prenoms nom_complet profession")
      .populate("service", "nom")
      .populate("materiaux");
    res.status(200).json({ services: services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.VendeursList = async (req, res, next) => {
  try {
    const vendeurs = await User.find({
      role: { $in: ["vendeur", "vendeur pro"] },
    }).limit(10);
    res.status(200).json({ vendeurs: vendeurs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getVendeurServiceBySearch = async (req, res, next) => {
  try {
    const nom = req.params.nom;
    const vendeurs = await User.find({
      $or: [
        { nom: { $regex: nom, $options: "i" } },
        { prenoms: { $regex: nom, $options: "i" } },
      ],
    }).limit(10);

    const services = await Service.find({
      nom: { $regex: nom, $options: "i" },
    });
    const servicesPrestataires = await ServicePrestataire.find({
      service: { $in: services },
    })
      .populate("vendeur")
      .populate("service");
    res
      .status(200)
      .json({ services: servicesPrestataires, vendeurs: vendeurs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserInfo = async (req, res, next) => {
  try {
    // Récupérer l'utilisateur actuel à partir de la demande
    const user = await getCurrentUser(req);

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }
    const updateFields = {
      departement: req.body.departement,
      ville: req.body.ville,
      quartier: req.body.quartier,
      localisationMap: req.body.localisationMap,
    };
    if (req.files["photo"]) {
      updateFields.photoDeProfil = req.files["photo"][0].path;
    }
    await User.updateOne({ _id: user._id }, updateFields);
    res.status(200).json({
      message: "Informations utilisateur mises à jour avec succès!",
    });
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({
      message: "Erreur lors de la mise à jour des informations utilisateur",
      error: error.message,
    });
  }
};

exports.registerFcmToken = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req);
    const token = req.body.token;
    const isAdmin = req.body.isAdmin || false;
    const fcmToken = new FcmToken({
      user: user,
      token: token,
      isAdmin: isAdmin,
    });

    await fcmToken
      .save()
      .then((token) => {
        res.status(201).json({ message: "Token FCM enregistré avec succès" });
      })
      .catch((error) => {
        res.status(404).json({
          error: error,
        });
      });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du token FCM :", error);
    res.status(500).json({
      error: "Une erreur s'est produite lors de l'enregistrement du token FCM.",
    });
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const user = req.user;
    req.body.client = user;
    const service = await ServicePrestataire.findById(req.body.service);
    if (!service) {
      throw new Error("Service introuvable");
    }
    FedaPay.setApiKey(process.env.FEDAPAY_API_SECRET_KEY);
    FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT);
    const transaction = await Transaction.create({
      description: `Commande du client ${user.nom} ${user.prenoms}`,
      amount: service.tarif,
      callback_url: "http://localhost:300/users/callback-paiement",
      currency: {
        iso: "XOF",
      },
      customer: {
        email: user.email,
      },
    });
    const token = await transaction.generateToken();
    console.log("ok3");
    req.body.id_transaction = transaction.id;
    console.log("ok4");
    const nouvelleCommande = await Commande.create(req.body);
    res.redirect(token.url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.callbackPaiement = async (req, res, next) => {
  try {
    const { id, status } = req.query;
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Paramètres manquants dans l'URL de callback",
      });
    }

    // Trouver et mettre à jour la commande
    let commande = await Commande.findOneAndUpdate(
      { id_transaction: id },
      { statut: "en_attente" },
      { new: true }
    );

    if (!commande) {
      return res
        .status(404)
        .json({ success: false, message: "Commande non trouvée" });
    }

    // Populer les documents liés
    await commande.populate({
      path: "service",
      populate: {
        path: "vendeur",
        populate: {
          path: "portefeuille",
        },
      },
    });
    commande.service.vendeur.portefeuille.montantEnAttente +=
      commande.service.tarif * 0.9;

    await commande.service.vendeur.portefeuille.save();
    res.status(200).json({
      success: true,
      message: "Statut de la commande mis à jour avec succès",
      commande,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la commande :",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour du statut de la commande",
    });
  }
};

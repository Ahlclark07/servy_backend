// controllers/categorieDeServiceController.js
const fs = require("fs");
const CategorieDeService = require("../../models/categorieDeService");
const appRoot = require("app-root-path");
const Service = require("../../models/Service");
const User = require("../../models/user");
const Demande = require("../../models/demande");
// Méthode pour créer une nouvelle catégorie de service
exports.createCategorieDeService = async (req, res) => {
  try {
    const categorie = await CategorieDeService.findOne({ nom: req.body.nom });
    req.body.image = req.file.filename;
    if (categorie) throw new Error("Existe déjà");
    const nouvelleCategorie = await CategorieDeService.create(req.body);
    res.status(201).json(nouvelleCategorie);
  } catch (error) {
    res.status(400).json({ message: error.message, provided: req.body });
  }
};

// Méthode pour récupérer toutes les catégories de service
exports.getAllCategoriesDeService = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;

    const categories = await CategorieDeService.find({
      nom: { $regex: nom, $options: "i" },
    })
      .skip(skip)
      .limit(10)
      .exec();
    const total = await CategorieDeService.countDocuments();
    res.status(200).json({ categories, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCatsNameAndIds = async (req, res) => {
  try {
    const categories = await CategorieDeService.find({})
      .select("nom _id actif")
      .exec();
    const total = await CategorieDeService.countDocuments();
    res.status(200).json({ categories, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Méthode pour récupérer une catégorie de service par son ID

// Méthode pour mettre à jour une catégorie de service
exports.updateCategorieDeService = async (req, res) => {
  try {
    req.body.image = req.file.filename;
    const categorie = await CategorieDeService.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true }
    );
    if (!categorie) {
      return res
        .status(404)
        .json({ message: "Catégorie de service non trouvée" });
    }
    res.status(200).json(categorie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategorieState = async (req, res) => {
  try {
    const categorie = await CategorieDeService.findById(req.params.id);
    if (!categorie) {
      return res
        .status(404)
        .json({ message: "Catégorie de service non trouvée" });
    }
    await categorie.updateOne({ actif: !categorie.actif }).exec();

    if (categorie.actif) {
      await Service.updateMany({ categorie: categorie._id }, { actif: false });
    }
    res.status(200).json("Tache réalisée");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Méthode pour supprimer une catégorie de service
exports.deleteCategorieDeService = async (req, res) => {
  try {
    const categorie = await CategorieDeService.findByIdAndDelete(req.params.id);
    const services = await Service.deleteMany({ categorie: categorie._id });
    const imagePath = categorie.image; // Supposons que l'image soit stockée dans la propriété "image"

    fs.unlinkSync(
      appRoot + "/public/uploads/images/categories/" + imagePath,
      function (err) {
        if (err) throw err;
        console.log("File deleted!");
      }
    );

    if (!categorie) {
      return res
        .status(404)
        .json({ message: "Catégorie de service non trouvée" });
    }

    res
      .status(200)
      .json({ message: "Catégorie de service supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

// Méthode pour créer un nouveau service
exports.createService = async (req, res) => {
  try {
    const service = await Service.findOne({ nom: req.body.nom });
    if (service) throw new Error("Existe déjà");
    req.body.image = req.file.filename;
    console.log(req.body);
    const cat = await CategorieDeService.findById(req.body.cat_id);
    if (!cat) throw new Error("La catégorie choisie n'existe plus.");

    req.body.categorie = cat._id;
    console.log(req.cat);
    const nouveauService = await Service.create(req.body);
    res.status(201).json(nouveauService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Méthode pour récupérer tous les services
exports.getServices = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;
    const services = await Service.find({
      nom: { $regex: nom, $options: "i" },
    })
      .skip(skip)
      .limit(10)
      .populate("categorie")
      .exec();
    const total = await Service.countDocuments();
    res.status(200).json({ services, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getServicesByCat = async (req, res) => {
  try {
    const skip = req.params.skip || 0;

    const services = await Service.find({
      categorie: req.params.categorie,
    })
      .skip(skip)
      .limit(10)
      .populate("categorie")
      .exec();
    const total = await Service.countDocuments();
    res.status(200).json({ services, total });
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
exports.updateServiceState = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    await service.updateOne({ actif: !service.actif });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Méthode pour supprimer un service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    const imagePath = service.image; // Supposons que l'image soit stockée dans la propriété "image"

    fs.unlinkSync(
      appRoot + "/public/uploads/images/services/" + imagePath,
      function (err) {
        if (err) throw err;
        console.log("File deleted!");
      }
    );
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServsNameAndIds = async (req, res) => {
  try {
    const services = await Service.find({}).select("nom _id actif").exec();
    const total = await Service.countDocuments();
    res.status(200).json({ services, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getClientsNameAndIds = async (req, res) => {
  try {
    const services = await Service.find({}).select("nom _id actif").exec();
    const total = await Service.countDocuments();
    res.status(200).json({ services, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getServicesPrestataire = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;

    const services = await Service.find({
      nom: { $regex: nom, $options: "i" },
    });
    const servicesPrestataires = await ServicePrestataire.find({
      service: { $in: services },
      verifie: { $in: ["En attente", "Accepté"] },
    })
      .skip(skip)
      .limit(10)
      .populate("vendeur", "nom prenoms nom_complet role")
      .populate("service", "nom")
      .exec();
    const total = await ServicePrestataire.countDocuments();
    res.status(200).json({ servicesPrestataires, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getServicesPrestataireByUser = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;

    const vendeurs = await User.find({
      nom: { $regex: nom, $options: "i" },
      role: { $in: ["vendeur", "vendeur pro"] },
    });
    console.log(vendeurs);
    const servicesPrestataires = await ServicePrestataire.find({
      vendeur: { $in: vendeurs },
      verifie: { $in: ["En attente", "Accepté"] },
    })
      .skip(skip)
      .limit(10)
      .populate("vendeur", "nom prenoms nom_complet role")
      .populate("service", "nom")
      .exec();
    const total = await ServicePrestataire.countDocuments();
    res.status(200).json({ servicesPrestataires, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
exports.getServicesPrestataireByServ = async (req, res) => {
  try {
    const skip = req.params.skip || 0;

    const servicesPrestataires = await ServicePrestataire.find({
      service: req.params.service,
      verifie: { $in: ["En attente", "Accepté"] },
    })
      .skip(skip)
      .limit(10)
      .populate("vendeur", "nom prenoms nom_complet role")
      .populate("service", "nom")
      .exec();

    const total = await ServicePrestataire.countDocuments();
    console.log({ servicesPrestataires, total });
    res.status(200).json({ servicesPrestataires, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateServicePrestataireState = async (req, res) => {
  try {
    const service = await ServicePrestataire.findById(req.body.id);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    const decision = req.body.decision;
    if (decision != 0) {
      await service.updateOne({
        verifie: "Accepté",
        messageAdmin: "Vous êtes prêt à vendre votre service !",
      });
    } else {
      await service.updateOne({
        verifie: "Refusé",
        messageAdmin: req.body.message,
      });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Méthode pour supprimer un service
exports.deleteServicePrestataire = async (req, res) => {
  try {
    const service = await ServicePrestataire.findByIdAndDelete(req.params.id);
    const imagePath = service.image; // Supposons que l'image soit stockée dans la propriété "image"

    fs.unlinkSync(
      appRoot + "/public/uploads/images/servicesprestataires/" + imagePath,
      function (err) {
        if (err) throw err;
        console.log("File deleted!");
      }
    );
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Utilisateur en transition

// Méthode pour récupérer toutes les catégories de service
exports.getAllClientsEnTransition = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;
    const clients = await User.find({
      nom: { $regex: nom, $options: "i" },
      enTransition: true,
    })
      .skip(skip)
      .limit(10)
      .populate("adresses")
      .exec();
    const total = await User.countDocuments();

    res.status(200).json({ clients, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getUsers = async (req, res) => {
  try {
    const skip = req.params.skip || 0;
    const nom =
      req.params.nom == " " || req.params.nom == "%20" ? "" : req.params.nom;

    const clients = await User.find({
      nom: { $regex: nom, $options: "i" },
      role: { $regex: req.params.role, $options: "i" },
    })
      .skip(skip)
      .limit(10)
      .populate("adresses")
      .exec();
    const total = await User.countDocuments();
    res.status(200).json({ clients, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserState = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    await user.updateOne({ actif: !user.actif });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateDemandeState = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    const demande = Demande.find({ user: user._id, status: "en attente" });
    if (!demande)
      return res.status(404).json({ message: "Une erreur est survenue" });
    if (req.body.decision != 0) {
      const nouveauRole =
        user.role == "client" && user.attestationProfession
          ? "vendeur"
          : "vendeur pro";

      await user.updateOne({ role: nouveauRole, enTransition: false });

      await demande.updateOne({ status: "acceptée" });
    } else {
      await user.updateOne({ enTransition: false });
      await demande.updateOne({ status: "refusée", message: req.body.message });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const ServicePrestataire = require("../../models/servicePrestataire");

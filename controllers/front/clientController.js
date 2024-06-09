const User = require("../../models/user");
const admin = require("../../config/firebase-config");
const Commande = require("../../models/commande");
const Adresse = require("../../models/adresse");
const { FedaPay, Customer } = require("fedapay");

exports.becomeClient = (req, res, next) => {
  //Récupérer le token d'authentification de l'utilisateur à partir de la requête
  const idToken = req.headers.authorization.split(" ")[1];
  console.log("headers : ");
  console.log(req.headers.authorization);
  console.log("body : ");
  console.log(req.body);
  // Vérifier le token d'authentification et extraire l'ID de l'utilisateur
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(async (decodedToken) => {
      const userId = decodedToken.uid;
      const userEmail = decodedToken.email;
      console.log(decodedToken);

      const adresse = await Adresse.create({
        departement: req.body.departement,
        ville: req.body.ville,
        quartier: req.body.quartier,
        localisationMap: req.body.localisationMap,
        informations: req.body.informations,
      });
      // Créer un nouvel utilisateur avec l'ID de l'utilisateur récupéré
      const user = new User({
        idFirebase: userId,
        role: "client",
        nom: req.body.nom,
        prenoms: req.body.prenoms,
        email: userEmail,
        telephone: req.body.telephone,
        dateDeNaissance: Date(req.body.dateDeNaissance),
        adresses: [adresse._id],
      });

      // Enregistrer l'utilisateur dans la base de données
      user
        .save()
        .then(async () => {
          // FedaPay.setApiKey(process.env.FEDAPAY_API_SECRET_KEY);
          // FedaPay.setEnvironment(process.env.FEDAPAY_ENVIRONMENT);
          // const customer = await Customer.create({
          //   firstname: user.prenoms,
          //   lastname: user.nom,
          //   email: user.email,
          //   phone_number: {
          //     number: user.telephone,
          //     country: "BJ",
          //   },
          // });
          res.status(201).json({
            user: user,
            message: "Client enregistré avec succès!",
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      // Gérer les erreurs de vérification du token d'authentification
      res.status(401).json({
        error: "Erreur de vérification du token d'authentification",
      });
    });
};

exports.clientListOrder = async (req, res, next) => {
  try {
    user = req.user;
    listCommande = [];
    listCommande = await Commande.find({ client: user._id }).populate(
      "service"
    );
    res.send(listCommande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clientListOrderByStatus = async (req, res, next) => {
  try {
    user = req.user;
    listCommande = [];
    listCommande = await Commande.find({
      client: user._id,
      statut: req.params.statut,
    }).populate("service");
    res.send(listCommande);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clientCancelOrder = async (req, res) => {
  try {
    user = req.user;
    commande = await Commande.findOne({ _id: req.params.id });
    if (String(commande.client) == String(user._id)) {
      await commande.updateOne({ statut: "annulee" });
      res.status(201).send("Commande annulée");
      await commande.populate({
        path: "service",
        populate: {
          path: "vendeur",
          populate: {
            path: "portefeuille",
          },
        },
      });
      commande.service.vendeur.portefeuille.montantEnAttente -=
        commande.service.tarif * 0.9;

      await commande.service.vendeur.portefeuille.save();
    } else {
      throw new Error("Accès interdit ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrderRequest = async (req, res) => {
  try {
    user = req.user;
    commande = await Commande.findOne({ _id: req.params.id });
    if (String(commande.client) == String(user._id)) {
      commande.demandeAnnulation = true;
      await commande.save();
      res.status(200).json({ commande });
    } else {
      throw new error("Accès interdit");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.endOrder = async (req, res, next) => {
  try {
    user = req.user;
    commande = await Commande.findOne({ _id: req.params.id });
    if (String(commande.client) == String(user._id)) {
      await commande.updateOne({
        statut: "terminee",
        evaluation: req.params.evaluation,
      });
      await commande.populate({
        path: "service",
        populate: {
          path: "vendeur",
          populate: {
            path: "portefeuille",
          },
        },
      });
      commande.service.vendeur.portefeuille.montantEnAttente -=
        commande.service.tarif * 0.9;
      commande.service.vendeur.portefeuille.montant +=
        commande.service.tarif * 0.9;
      await commande.service.vendeur.portefeuille.save();
      res.status(201).send("Commande terminée");
    } else {
      throw new Error("Accès interdit ");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

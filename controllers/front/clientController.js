const User = require("../../models/user");
const admin = require("../../config/firebase-config");
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
          FedaPay.setApiKey(process.env.FEDAPAY_API_SECRET_KEY);
          FedaPay.setEnvironment("sandbox");
          const customer = await Customer.create({
            firstname: user.prenoms,
            lastname: user.nom,
            email: user.email,
            phone_number: {
              number: user.telephone,
              country: "BJ",
            },
          });
          res.status(201).json({
            user: user,
            message: "Client enregistré avec succès!",
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json({
            error: error,
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

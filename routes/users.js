const UsersRouter = require("express").Router();
const clientController = require("../controllers/front/clientController");
const userController = require("../controllers/front/userController");
const vendeurController = require("../controllers/front/vendeurController");
const middleware = require("../middleware/auth");
const { upload_materiel_config } = require("../middleware/multer-config");
const profil_file_mid =
  require("../middleware/multer-config").profil_user_config;
const service_presta_files_mid =
  require("../middleware/multer-config").upload_servicePresta_config;
const serv_file_mid =
  require("../middleware/multer-config").upload_service_config;
/* GET users listing. */
UsersRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

UsersRouter.get("/getUser", middleware.decodeToken, userController.userRole);
UsersRouter.get(
  "/servicesList",
  middleware.decodeToken,
  userController.servicesList
);
UsersRouter.get(
  "/vendeursProches",
  middleware.decodeToken,
  userController.vendeursProches
);
UsersRouter.get("/vendeursList", userController.VendeursList);
UsersRouter.get(
  "/servicesPrestatairesList",
  userController.ServicePrestataireList
);
UsersRouter.get(
  "/getVendeurServiceBySearch/:nom",
  userController.getVendeurServiceBySearch
);

UsersRouter.post(
  "/becomeClient",
  serv_file_mid.any(),
  middleware.decodeToken,
  clientController.becomeClient
);

UsersRouter.post(
  "/becomeSeller",
  middleware.decodeToken,
  profil_file_mid,
  vendeurController.becomeSeller
);
UsersRouter.post(
  "/becomeProSeller",
  middleware.decodeToken,
  profil_file_mid,
  vendeurController.becomeProSeller
);
UsersRouter.put(
  "/updateUserInfo",
  middleware.decodeToken,
  profil_file_mid,
  userController.updateUserInfo
);
UsersRouter.post(
  "/registerFcmToken",
  middleware.decodeToken,
  userController.registerFcmToken
);

UsersRouter.post(
  "/materiel",
  upload_materiel_config.single("image"),
  vendeurController.createMateriel
);
UsersRouter.delete("/materiel", vendeurController.deleteMateriel);
UsersRouter.post(
  "/createserviceprestataire",
  middleware.decodeToken,
  service_presta_files_mid.any(),
  vendeurController.createServicePrestataire
);
UsersRouter.get(
  "/getservicesofaprestataire/:id",

  vendeurController.getServicesOfAPrestataire
);

UsersRouter.post(
  "/placeOrder",
  service_presta_files_mid.any(),

  middleware.decodeToken,
  userController.placeOrder
);

UsersRouter.get(
  "/listOrder",
  middleware.decodeToken,
  vendeurController.listOrder
);

UsersRouter.get(
  "/clientListOrder",
  middleware.decodeToken,
  clientController.clientListOrder
);
UsersRouter.get(
  "/getOrder/:id",
  middleware.decodeToken,
  userController.getCommande
);

UsersRouter.get(
  "/listOrderByStatus/:statut",
  middleware.decodeToken,
  vendeurController.listOrderByStatus
);

UsersRouter.get(
  "/clientListOrderByStatus/:statut",
  middleware.decodeToken,
  clientController.clientListOrderByStatus
);

UsersRouter.patch(
  "/validateOrder/:id",
  middleware.decodeToken,
  vendeurController.validateOrder
);

UsersRouter.patch(
  "/cancelOrder/:id",
  middleware.decodeToken,
  vendeurController.cancelOrder
);

UsersRouter.patch(
  "/endOrderRequest/:id",
  middleware.decodeToken,
  vendeurController.endOrderRequest
);

UsersRouter.patch(
  "/endOrder/:id/:evaluation",
  middleware.decodeToken,
  clientController.endOrder
);

UsersRouter.patch(
  "/clientCancelOrder/:id",
  middleware.decodeToken,
  clientController.clientCancelOrder
);

UsersRouter.patch(
  "/cancelOrderRequest/:id",
  middleware.decodeToken,
  clientController.cancelOrderRequest
);

UsersRouter.get("/callback-paiement", userController.callbackPaiement);
UsersRouter.get(
  "/listcommandes",
  middleware.decodeToken,
  userController.listCommandes
);

UsersRouter.post(
  "/makeRetrait",
  middleware.decodeToken,
  vendeurController.makeRetrait
);

UsersRouter.get("/getCategories", userController.getCategories);
UsersRouter.get(
  "/getServicesByCat/:categorie",
  userController.getServicesByCat
);
module.exports = UsersRouter;

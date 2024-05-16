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

UsersRouter.post(
  "/placeOrder",
  middleware.decodeToken,
  userController.placeOrder
);
UsersRouter.post(
  "/makeRetrait",
  middleware.decodeToken,
  vendeurController.makeRetrait
);

module.exports = UsersRouter;

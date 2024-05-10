const express = require("express");
const AdminRouter = express.Router();
const adminController = require("../controllers/admin/adminController");

const cat_file_mid = require("../middleware/multer-config").upload_cat_config;
const serv_file_mid =
  require("../middleware/multer-config").upload_service_config;

AdminRouter.get(
  "/getCategories/:nom/:skip",
  adminController.getAllCategoriesDeService
);
AdminRouter.get("/getCategories/", adminController.getCatsNameAndIds);

AdminRouter.post(
  "/createCategorie",
  cat_file_mid.single("image"),
  adminController.createCategorieDeService
);
AdminRouter.get(
  "/supprimerCategorie/:id",
  adminController.deleteCategorieDeService
);
AdminRouter.post(
  "/updateCategorie",
  cat_file_mid.single("image"),
  adminController.updateCategorieDeService
);
AdminRouter.post(
  "/createService",
  serv_file_mid.single("image"),
  adminController.createService
);
AdminRouter.get("/getServices/:nom/:skip", adminController.getServices);
AdminRouter.get(
  "/getServicesByCat/:categorie/:skip",
  adminController.getServicesByCat
);
AdminRouter.get("/supprimerService/:id", adminController.deleteService);
AdminRouter.post(
  "/updateService",
  serv_file_mid.single("image"),
  adminController.updateService
);
AdminRouter.get("/updateServiceState/:id", adminController.updateServiceState);

AdminRouter.get(
  "/getServicesPrestataire/:nom/:skip",
  adminController.getServicesPrestataire
);
AdminRouter.get(
  "/getServicesPrestataireByUser/:nom/:skip",
  adminController.getServicesPrestataireByUser
);
AdminRouter.get("/getServices/", adminController.getServsNameAndIds);
AdminRouter.get(
  "/getServicesPrestataireByServ/:service/:skip",
  adminController.getServicesPrestataireByServ
);

AdminRouter.get(
  "/supprimerServicePrestataire/:id",
  adminController.deleteServicePrestataire
);
AdminRouter.post(
  "/updateServicePrestataire",
  serv_file_mid.single("image"),
  adminController.updateServicePrestataireState
);
AdminRouter.post(
  "/updateServicePrestataireState",
  serv_file_mid.any(),
  adminController.updateServicePrestataireState
);

// State

AdminRouter.get(
  "/updateCategorieState/:id",
  adminController.updateCategorieState
);
AdminRouter.post(
  "/updateDemandeState",
  serv_file_mid.any(),
  adminController.updateDemandeState
);

AdminRouter.get("/updateUserState/:id", adminController.updateUserState);
AdminRouter.get(
  "/getClientsEnTransition/:nom/:skip",
  adminController.getAllClientsEnTransition
);
AdminRouter.get("/getUsers/:role/:nom/:skip", adminController.getUsers);

module.exports = AdminRouter;

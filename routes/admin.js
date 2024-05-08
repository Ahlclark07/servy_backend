const AdminRouter = require("express").Router();
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
AdminRouter.get("/getServices/:nom/:skip", adminController.getServices);
AdminRouter.get(
  "/getServicesByCat/:categorie/:skip",
  adminController.getServicesByCat
);

AdminRouter.post(
  "/createService",
  serv_file_mid.single("image"),
  adminController.createService
);
AdminRouter.get("/supprimerService/:id", adminController.deleteService);
AdminRouter.post(
  "/updateService",
  serv_file_mid.single("image"),
  adminController.updateService
);

// State
AdminRouter.get("/updateServiceState/:id", adminController.updateServiceState);
AdminRouter.get(
  "/updateCategorieState/:id",
  adminController.updateCategorieState
);
AdminRouter.get("/updateUserState/:id", adminController.updateUserState);
AdminRouter.get(
  "/getClientsEnTransition/:nom/:skip",
  adminController.getAllClientsEnTransition
);

module.exports = AdminRouter;

const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads/photos/" + file.originalname);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const storageCat = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/categories");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const storageService = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/services");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const storageMateriel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/materiaux");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storageServicesPrestataires = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/uploads/";
    if (file.fieldname === "audio") {
      cb(null, dir + "audios/servicesprestataires");
    } else if (file.fieldname == "images") {
      cb(null, dir + "images/servicesprestataires");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
exports.upload_servicePresta_config = multer({
  storage: storageServicesPrestataires,
});
const storageProfilVendeurs = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/uploads/images/" + file.fieldname + "s";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
exports.upload_servicePresta_config = multer({
  storage: storageServicesPrestataires,
});

exports.profil_user_config = multer({ storage: storageProfilVendeurs }).fields([
  { name: "carteidentite", maxCount: 1 },
  { name: "photodeprofil", maxCount: 1 },
  { name: "attestationprofession", maxCount: 1 },
]);
exports.upload_cat_config = multer({ storage: storageCat });
exports.upload_service_config = multer({ storage: storageService });
exports.upload_materiel_config = multer({ storage: storageMateriel });

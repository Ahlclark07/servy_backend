const admin = require("../config/firebase-config");
const User = require("../models/user");
class Middleware {
  async decodeToken(req, res, next) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // console.log(req.headers.authorization);
      const decodeValue = await admin
        .auth()
        .verifyIdToken(token ?? req.headers.authorization);
      if (decodeValue) {
        req.user = await User.findOne({ idFirebase: decodeValue.uid })
          .populate("adresses")
          .populate("portefeuille");
        return next();
      }
      return res.json({ message: "Non autorisé" });
    } catch (error) {
      console.log(error);
      res.status(401).json(error);
    }
  }
}
module.exports = new Middleware();

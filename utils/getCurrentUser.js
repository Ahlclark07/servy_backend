const User = require("../models/user");
const admin = require("../config/firebase-config");

async function getCurrentUser(req) {
    try {
        const idToken = req.headers.authorization.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const idFirebase = decodedToken.uid;

        const user = await User.findOne({ idFirebase });
        if (user) {
            return user;
        } else {
            throw new Error("Utilisateur non trouvé");
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getCurrentUser
};

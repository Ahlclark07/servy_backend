
var admin = require("firebase-admin");

var serviceAccount = require('./serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports=admin;
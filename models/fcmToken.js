const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fcmTokenSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});
const FcmToken = mongoose.model('FcmToken', fcmTokenSchema);
module.exports = FcmToken;
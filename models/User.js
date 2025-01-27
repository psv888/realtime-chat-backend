const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    contacts: [{ type: String }], // Store contacts as an array of usernames
});

module.exports = mongoose.model('User', UserSchema);

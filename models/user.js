const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    jobTitle: String,
    gender: { type: String, required: true },
    profileImage: { type: String }, // Store the file path or URL
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
    },
}, {
    timestamps: true,
    collection: 'users' // Explicitly set collection name to avoid conflicts
});

// Ensure no username field is accidentally added
userSchema.set('toJSON', {
    transform: function(doc, ret) {
        delete ret.username;
        return ret;
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

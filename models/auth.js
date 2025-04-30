const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  gender: { type: String, required: true },
   // For  Admin or Unique ID

   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },

   role: { type: String, enum: ["admin", "user"], default: "user" }

});

// Password hash middleware
authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
authSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Auth", authSchema);

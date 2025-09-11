import mongoose, { mongo } from "mongoose";
import required from "../utils/required.js";
import bcrypt from "bcrypt";
let userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, required("username")],
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    gameId: { type: Number, sparse: true, index: true, unique: true },
    gameName: { type: String, sparse: true },
    contact: { type: Number, sparse: true },
    email: {
      type: String,
      required: [true, required("email")],
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    emailVerified: { type: Boolean },
    password: {
      type: String,
      required: [true, required("password")],
      trim: true,
      // select:false
    },
    lastLogin: { type: String },
    loginAttempt: { type: Number, min: 0, default: 0 },
    failedAttempt: { type: Number, max: 5, default: 0 },
    refreshToken: { type: String },
    otp: {
      code: { type: String },
      verified: { type: Boolean },
      expiry: { type: Date },
    },
    role: {
      type: [String],
      default: ["leader"],
      required: required("role"),
      enum: ["organizer", "leader", "admin"],
    },
    block: { blocked: { type: Boolean, default: false }, duration: Number },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      sparse: true,
    },
    organized: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", sparse: true },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        sparse: true,
        index: true,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre("findByIdAndUpdate", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();

  if (update.password) {
    let hashed = await bcrypt.hash(update.password, 10);
    this.setUpdate({ ...update, password: hashed });
  }
  next();
});

let User = mongoose.model("User", userSchema);
export default User;

import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    avatar: { type: String, default: "" },

    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    gender: String,
    phone: String,

    // Password used on initial admin creation and future password updates.
    password: {
      type: String,
      required: true,
    },

    // Optional temp password for first-time login or manual sharing.
    tempPassword: {
      type: String,
      default: "",
    },

    accountType: {
      type: String,
      enum: ["admin", "editor", "iam"],
      default: "editor",
    },

    permissions: {
      type: [String],
      default: ["read"],
    },

    // New fields for admin-controlled password change policy.
    passwordChangeAllowed: {
      type: Boolean,
      default: false,
    },

    passwordChangeReason: {
      type: String,
      default: "",
    },

    passwordChangeRequestedAt: {
      type: Date,
      default: null,
    },

    fcmToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = model("Admin", adminSchema);

export default Admin;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, required: true },
  trends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trend" }],
  onboarded: { type: Boolean, default: false },
  comunities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

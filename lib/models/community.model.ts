import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  image: { type: String },
  trends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trend" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Community =
  mongoose.models.Community || mongoose.model("Community", communitySchema);
export default Community;

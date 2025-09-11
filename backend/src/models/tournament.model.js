import mongoose, { mongo } from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    prizePool: { type: Number, default: 0, min: 0 },
    prizeDistribution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrizeDistribution",
    },
    entryFee: { type: Number, default: 0, min: 0 },
    slots: {
      max: { type: Number, required: true },
      filled: { type: Number, min: 0 },
    },
    winners: [
      {
        position: { type: Number },
        prize: { type: Number },
        team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
      },
    ],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    lockedFunds: { type: Number, min: 0 },
    postponedUntil: { type: Date },
    rules: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);

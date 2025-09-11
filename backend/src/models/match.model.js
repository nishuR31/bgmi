import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    round: { type: Number, required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "postponed"],
      default: "scheduled",
    },
    startTime: { type: Date },
    endTime: { type: Date },
    scoreBoard: [
      {
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        kills: { type: Number, default: 0 },
        placementPoints: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);

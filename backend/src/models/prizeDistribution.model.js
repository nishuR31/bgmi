import mongoose from "mongoose";

const prizeDistributionSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    total: {
      type: Number,
    },
    distribution: [
      {
        position: { type: Number, required: true, min: 1 }, // 1 = 1st, 2 = 2nd, etc.
        amount: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("PrizeDistribution", prizeDistributionSchema);

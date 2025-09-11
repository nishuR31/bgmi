import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "entry_fee",
        "prize",
        "refund",
        "lock",
        "unlock",
      ],
      required: true,
    },
    amount: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "locked"],
      default: "pending",
    },
    relatedTournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
    },
    meta: { type: Object }, // store extra info like gateway txn id, remarks, etc.
  },
  { timestamps: true }
);

let Transactions = mongoose.model("Transactions", transactionSchema);
export default Transactions;

import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // organizer/creator of this team
      required: true,
      index: true,
    },

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // organizer/creator of this team
      required: true,
      index: true,
    },

    members: [
      {
        gameUid: { type: String, required: true },
        gameName: { type: String, required: true },
      },
    ],

    substitute: {
      gameUid: { type: String },
      gameName: { type: String },
    },

    maxMembers: {
      type: Number,
      default: 5, // 4 members + 1 sub
    },
    status: {
      type: String,
      enum: ["registered", "approved", "disqualified"],
      default: "registered",
    },

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      index: true,
    },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }],
  },
  { timestamps: true }
);

// teamSchema.index({ name: 1, status: 1 });

const Team = mongoose.model("Team", teamSchema);

export default Team;

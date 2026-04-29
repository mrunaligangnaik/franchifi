const mongoose = require("mongoose");

const FranchiseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },

    minInvestment: { type: Number, required: true },
    maxInvestment: { type: Number },

    expectedROI: { type: String },
    franchiseFee: { type: Number },
    royaltyFee: { type: String },

    location: { type: String },

    image: { type: String },
    logo: { type: String },

    established: { type: Number },
    outlets: { type: Number },

    supportProvided: [String],

    documents: [
      {
        name: String,
        url: String,
      }
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// ✅ FIX: Prevent model overwrite issue (DO NOT CHANGE ANYTHING ELSE)
module.exports =
  mongoose.models.Franchise ||
  mongoose.model("Franchise", FranchiseSchema);

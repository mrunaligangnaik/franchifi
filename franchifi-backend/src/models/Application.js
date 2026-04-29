const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    franchiseId: {
      type: String,
      required: true,
    },

    franchiseName: {
      type: String,
      required: true,
    },

    franchiseImage: {
      type: String,
    },

    franchiseLocation: {
      type: String,
    },

    franchiseCategory: {
      type: String,
    },

    fullName: String,
    email: String,
    phone: String,
    city: String,
    investmentBudget: String,
    industryExperience: String,
    experienceDescription: String,
    preferredLocation: String,
    startTimeline: String,
    additionalInfo: String,

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "pending",
        "approved",
        "rejected",
        "shortlisted",
        "under_review",
      ],
      default: "draft",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    remarks: {
      type: String,
      trim: true,
    },

    submittedAt: Date,
    reviewedAt: Date,

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✅ investor can ask why their application was rejected
    investorQuery: {
      type: String,
      trim: true,
      default: null,
    },

    investorQueryAt: {
      type: Date,
      default: null,
    },

    // ✅ NEW: franchisor replies to investor's query → investor gets bell notification
    franchisorReply: {
      type: String,
      trim: true,
      default: null,
    },

    franchisorReplyAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
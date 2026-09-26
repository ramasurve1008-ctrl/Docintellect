import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalProcessed: {
      type: Number,
      default: 0,
    },
    autoApprovedCount: {
      type: Number,
      default: 0,
    },
    flaggedCount: {
      type: Number,
      default: 0,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
    totalClaimValue: {
      type: Number,
      default: 0,
    },
    approvedClaimValue: {
      type: Number,
      default: 0,
    },
    avgProcessingTimeMs: {
      type: Number,
      default: 0,
    },
    fraudRiskDistribution: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Insight = mongoose.models.Insight || mongoose.model('Insight', insightSchema);
export default Insight;

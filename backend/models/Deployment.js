import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  portfolio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
  },
  netlifyId: {
    type: String,
  },
  siteName: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['building', 'success', 'failed'],
    default: 'building',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Deployment = mongoose.model('Deployment', deploymentSchema);
export default Deployment;

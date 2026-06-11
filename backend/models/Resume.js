import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt'],
  },
  parsedText: {
    type: String,
    required: true,
  },
  parsedJson: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;

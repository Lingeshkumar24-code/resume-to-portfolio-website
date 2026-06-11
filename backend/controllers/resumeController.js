import fs from 'fs';
import path from 'path';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Upload and Parse a Resume
// @route   POST /api/resumes/upload
// @access  Private
export const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let parsedText = '';

    const fileBuffer = fs.readFileSync(filePath);

    if (ext === '.pdf') {
      try {
        const pdfData = await pdfParse(fileBuffer);
        parsedText = pdfData.text;
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
        return res.status(400).json({ success: false, message: 'Failed to parse PDF file' });
      }
    } else if (ext === '.docx') {
      try {
        const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
        parsedText = docxData.value;
      } catch (docxErr) {
        console.error('DOCX parsing error:', docxErr);
        return res.status(400).json({ success: false, message: 'Failed to parse DOCX file' });
      }
    } else if (ext === '.txt') {
      parsedText = fileBuffer.toString('utf-8');
    }

    if (!parsedText || parsedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the file' });
    }

    // Save to Database
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileType: ext.slice(1), // e.g. 'pdf', 'docx', 'txt'
      parsedText: parsedText.trim(),
      parsedJson: {}, // Will be populated by AI analysis
    });

    return res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ success: false, message: 'Server error during upload/parse' });
  }
};

// @desc    Get all resumes of current user
// @route   GET /api/resumes
// @access  Private
export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get a specific resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    return res.json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    await resume.deleteOne();
    return res.json({ success: true, message: 'Resume removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

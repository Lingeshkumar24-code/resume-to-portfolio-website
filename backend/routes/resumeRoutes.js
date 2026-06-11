import express from 'express';
import { upload, uploadAndParseResume, getMyResumes, getResumeById, deleteResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);
router.get('/', protect, getMyResumes);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

export default router;

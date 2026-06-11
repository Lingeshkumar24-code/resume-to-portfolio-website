import express from 'express';
import { 
  generatePortfolio, 
  getMyPortfolios, 
  getPortfolioById, 
  updatePortfolio, 
  customizePortfolioWithAI, 
  deletePortfolio 
} from '../controllers/portfolioController.js';
import { downloadPortfolioSource } from '../controllers/downloadController.js';
import { deployPortfolio, getMyDeployments } from '../controllers/deployController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generatePortfolio);
router.get('/', protect, getMyPortfolios);
router.get('/deploys', protect, getMyDeployments);
router.get('/:id', protect, getPortfolioById);
router.put('/:id', protect, updatePortfolio);
router.post('/:id/customize', protect, customizePortfolioWithAI);
router.delete('/:id', protect, deletePortfolio);
router.get('/:id/download', protect, downloadPortfolioSource);
router.post('/:id/deploy', protect, deployPortfolio);

export default router;

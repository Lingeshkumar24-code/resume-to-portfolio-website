import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Portfolio from '../models/Portfolio.js';
import Deployment from '../models/Deployment.js';

// @desc    Get dashboard metrics for admin panel
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalResumes = await Resume.countDocuments({});
    const totalPortfolios = await Portfolio.countDocuments({});
    const totalDeployments = await Deployment.countDocuments({});

    // Fetch recent registrations
    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent portfolios
    const recentPortfolios = await Portfolio.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent deployments
    const recentDeployments = await Deployment.find({})
      .populate('portfolio', 'title')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Grouping resumes by file format
    const formatBreakdown = await Resume.aggregate([
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Grouping portfolios by profession
    const professionBreakdown = await Portfolio.aggregate([
      {
        $group: {
          _id: '$profession',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalResumes,
          totalPortfolios,
          totalDeployments,
        },
        recentUsers,
        recentPortfolios,
        recentDeployments,
        breakdowns: {
          formats: formatBreakdown,
          professions: professionBreakdown,
        },
      },
    });
  } catch (error) {
    console.error('Admin stats query error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving stats' });
  }
};

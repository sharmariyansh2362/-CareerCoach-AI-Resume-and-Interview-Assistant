const Generation = require('../models/Generation');

// @desc    Admin usage report using MongoDB aggregation pipeline
// @route   GET /api/admin/usage-report
// @access  Protected (Admin only)
const getUsageReport = async (req, res, next) => {
  try {
    // Aggregation pipeline on Generation collection
    // 1. Group by userId to calculate totalGenerations, resumeCount, interviewCount, and lastGeneratedAt
    // 2. Lookup user details (name, email, role) from users collection
    // 3. Unwind user array
    // 4. Project clean fields
    // 5. Sort by totalGenerations descending
    const userUsageStats = await Generation.aggregate([
      {
        $group: {
          _id: '$userId',
          totalGenerations: { $sum: 1 },
          resumeCount: {
            $sum: { $cond: [{ $eq: ['$type', 'resume'] }, 1, 0] }
          },
          interviewCount: {
            $sum: { $cond: [{ $eq: ['$type', 'interview'] }, 1, 0] }
          },
          lastGeneratedAt: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: { $ifNull: ['$userInfo.name', 'Deleted / Inactive User'] },
          email: { $ifNull: ['$userInfo.email', 'N/A'] },
          role: { $ifNull: ['$userInfo.role', 'user'] },
          totalGenerations: 1,
          resumeCount: 1,
          interviewCount: 1,
          lastGeneratedAt: 1
        }
      },
      {
        $sort: { totalGenerations: -1 }
      }
    ]);

    // Calculate platform totals
    const totalPlatformGenerations = userUsageStats.reduce((acc, curr) => acc + curr.totalGenerations, 0);
    const totalPlatformResumes = userUsageStats.reduce((acc, curr) => acc + curr.resumeCount, 0);
    const totalPlatformInterviews = userUsageStats.reduce((acc, curr) => acc + curr.interviewCount, 0);

    res.status(200).json({
      success: true,
      summary: {
        activeUsersCount: userUsageStats.length,
        totalGenerations: totalPlatformGenerations,
        totalResumes: totalPlatformResumes,
        totalInterviews: totalPlatformInterviews
      },
      data: userUsageStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsageReport
};

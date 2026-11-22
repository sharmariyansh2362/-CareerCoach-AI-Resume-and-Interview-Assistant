const Profile = require('../models/Profile');

// @desc    Get current logged-in user profile
// @route   GET /api/profile
// @access  Protected
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No profile found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update user profile
// @route   POST or PUT /api/profile
// @access  Protected
const upsertProfile = async (req, res, next) => {
  try {
    const { education, skills, experience } = req.body;

    // Validate skills presence
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one skill in your profile'
      });
    }

    // Filter out empty skills
    const cleanedSkills = skills
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter((s) => s.length > 0);

    if (cleanedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills array cannot contain only empty strings'
      });
    }

    const profileData = {
      userId: req.user.id,
      education: Array.isArray(education) ? education : [],
      skills: cleanedSkills,
      experience: Array.isArray(experience) ? experience : []
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  upsertProfile
};

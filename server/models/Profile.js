const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Education institution is required'],
      trim: true
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true
    },
    fieldOfStudy: {
      type: String,
      required: [true, 'Field of study is required'],
      trim: true
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
      min: [1950, 'Start year must be valid'],
      max: [2100, 'Start year cannot be in far future']
    },
    endYear: {
      type: Number,
      min: [1950, 'End year must be valid'],
      max: [2100, 'End year cannot be in far future']
    }
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Job role/title is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 2021 - 2023 or 2 years)'],
      trim: true
    },
    responsibilities: {
      type: String,
      required: [true, 'Responsibilities description is required'],
      trim: true
    }
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true
    },
    education: {
      type: [educationSchema],
      default: []
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
      validate: {
        validator: function (skillsArray) {
          return Array.isArray(skillsArray) && skillsArray.length > 0;
        },
        message: 'At least one skill is required in profile'
      }
    },
    experience: {
      type: [experienceSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;

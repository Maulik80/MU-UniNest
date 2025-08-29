import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Drive title is required'],
    trim: true,
    maxlength: [200, 'Drive title cannot exceed 200 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University is required']
  },
  jobDetails: {
    role: {
      type: String,
      required: [true, 'Job role is required']
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Job description cannot exceed 5000 characters']
    },
    responsibilities: [String],
    requirements: [String],
    skillsRequired: [String],
    experienceRequired: {
      type: String,
      enum: ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'],
      default: 'Fresher'
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time'
    },
    workMode: {
      type: String,
      enum: ['On-site', 'Remote', 'Hybrid'],
      default: 'On-site'
    },
    locations: [String]
  },
  compensation: {
    salaryRange: {
      min: {
        type: Number,
        required: [true, 'Minimum salary is required'],
        min: 0
      },
      max: {
        type: Number,
        required: [true, 'Maximum salary is required'],
        min: 0
      }
    },
    currency: {
      type: String,
      default: 'INR'
    },
    benefits: [String],
    bondPeriod: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  eligibilityCriteria: {
    minimumCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: 0,
      max: 10
    },
    allowedBacklogs: {
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      history: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    courses: [{
      type: String,
      enum: ['B.Tech', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'MBA', 'B.Sc', 'M.Sc', 'Other']
    }],
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],
    batches: [String],
    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any'
    },
    ageLimit: {
      min: Number,
      max: Number
    }
  },
  selectionProcess: {
    rounds: [{
      type: {
        type: String,
        enum: ['Online Test', 'Technical Interview', 'HR Interview', 'Group Discussion', 'Presentation', 'Coding Round'],
        required: true
      },
      description: String,
      duration: Number, // in minutes
      mode: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid'],
        default: 'Online'
      },
      isElimination: {
        type: Boolean,
        default: false
      },
      order: {
        type: Number,
        required: true
      }
    }],
    totalRounds: {
      type: Number,
      default: 1
    },
    expectedDuration: String
  },
  timeline: {
    registrationStart: {
      type: Date,
      required: [true, 'Registration start date is required']
    },
    registrationEnd: {
      type: Date,
      required: [true, 'Registration end date is required']
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required']
    },
    resultDate: Date,
    joiningDate: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  driveType: {
    type: String,
    enum: ['university_driven', 'company_driven'],
    required: [true, 'Drive type is required']
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalNotes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  eligibleStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    isInvited: {
      type: Boolean,
      default: false
    },
    invitedAt: Date,
    aiScore: {
      type: Number,
      min: 0,
      max: 100
    },
    aiRecommendation: String,
    manuallyAdded: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  shortlistedStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    round: Number,
    shortlistedAt: Date,
    notes: String
  }],
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  statistics: {
    totalEligible: {
      type: Number,
      default: 0
    },
    totalInvited: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalShortlisted: {
      type: Number,
      default: 0
    },
    totalSelected: {
      type: Number,
      default: 0
    },
    totalOffersReleased: {
      type: Number,
      default: 0
    },
    totalOffersAccepted: {
      type: Number,
      default: 0
    }
  },
  aiInsights: {
    recommendedStudents: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      score: Number,
      reasons: [String],
      generatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    analysisComplete: {
      type: Boolean,
      default: false
    },
    lastAnalysis: Date
  },
  settings: {
    allowStudentSelfRegistration: {
      type: Boolean,
      default: true
    },
    requireUniversityApproval: {
      type: Boolean,
      default: true
    },
    sendAutoNotifications: {
      type: Boolean,
      default: true
    },
    allowCompanyToViewApplications: {
      type: Boolean,
      default: true
    }
  },
  attachments: [{
    type: {
      type: String,
      enum: ['job_description', 'company_brochure', 'application_form', 'other']
    },
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    enum: ['University', 'Company'],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'updatedByModel'
  },
  updatedByModel: {
    type: String,
    enum: ['University', 'Company']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for registration status
placementDriveSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now < this.timeline.registrationStart) return 'not_started';
  if (now > this.timeline.registrationEnd) return 'closed';
  return 'open';
});

// Virtual for days until drive
placementDriveSchema.virtual('daysUntilDrive').get(function() {
  const now = new Date();
  const driveDate = new Date(this.timeline.driveDate);
  const diffTime = driveDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for application percentage
placementDriveSchema.virtual('applicationPercentage').get(function() {
  if (this.statistics.totalInvited === 0) return 0;
  return Math.round((this.statistics.totalApplications / this.statistics.totalInvited) * 100);
});

// Indexes
placementDriveSchema.index({ company: 1 });
placementDriveSchema.index({ university: 1 });
placementDriveSchema.index({ status: 1 });
placementDriveSchema.index({ approvalStatus: 1 });
placementDriveSchema.index({ 'timeline.registrationStart': 1 });
placementDriveSchema.index({ 'timeline.registrationEnd': 1 });
placementDriveSchema.index({ 'timeline.driveDate': 1 });
placementDriveSchema.index({ 'eligibilityCriteria.minimumCGPA': 1 });

// Pre-save middleware to update statistics
placementDriveSchema.pre('save', function(next) {
  // Update statistics based on arrays
  this.statistics.totalEligible = this.eligibleStudents.length;
  this.statistics.totalInvited = this.eligibleStudents.filter(s => s.isInvited).length;
  this.statistics.totalApplications = this.applications.length;
  this.statistics.totalShortlisted = this.shortlistedStudents.length;
  this.statistics.totalOffersReleased = this.offers.length;
  
  next();
});

// Method to check if student is eligible
placementDriveSchema.methods.isStudentEligible = function(student) {
  const criteria = this.eligibilityCriteria;
  
  // Check CGPA
  if (student.academicInfo.cgpa < criteria.minimumCGPA) return false;
  
  // Check backlogs
  if (student.academicInfo.backlogs.current > criteria.allowedBacklogs.current) return false;
  if (student.academicInfo.backlogs.history > criteria.allowedBacklogs.history) return false;
  
  // Check course
  if (criteria.courses.length > 0 && !criteria.courses.includes(student.academicInfo.course)) return false;
  
  // Check department
  if (criteria.departments.length > 0 && !criteria.departments.includes(student.academicInfo.department)) return false;
  
  // Check batch
  if (criteria.batches.length > 0 && !criteria.batches.includes(student.academicInfo.batch)) return false;
  
  // Check gender preference
  if (criteria.genderPreference !== 'Any' && student.personalInfo.gender !== criteria.genderPreference) return false;
  
  return true;
};

// Method to get drive phase
placementDriveSchema.methods.getCurrentPhase = function() {
  const now = new Date();
  
  if (now < this.timeline.registrationStart) return 'upcoming';
  if (now <= this.timeline.registrationEnd) return 'registration';
  if (now < this.timeline.driveDate) return 'pre_drive';
  if (now <= new Date(this.timeline.driveDate.getTime() + 24 * 60 * 60 * 1000)) return 'drive_day';
  if (this.timeline.resultDate && now < this.timeline.resultDate) return 'evaluation';
  return 'completed';
};

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);

export default PlacementDrive;

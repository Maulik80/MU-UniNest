import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      },
      pincode: String
    },
    profilePicture: {
      type: String,
      default: null
    }
  },
  academicInfo: {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: [true, 'University is required']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      enum: ['B.Tech', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'MBA', 'B.Sc', 'M.Sc', 'Other']
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required']
    },
    batch: {
      type: String,
      required: [true, 'Batch year is required'],
      match: [/^\d{4}$/, 'Batch year must be a 4-digit year']
    },
    prnNumber: {
      type: String,
      required: [true, 'PRN number is required'],
      unique: true
    },
    rollNumber: String,
    currentSemester: {
      type: Number,
      min: 1,
      max: 10
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      required: [true, 'CGPA is required']
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    backlogs: {
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
    }
  },
  previousEducation: {
    class12: {
      board: String,
      school: String,
      year: Number,
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      stream: {
        type: String,
        enum: ['Science', 'Commerce', 'Arts', 'Other']
      }
    },
    class10: {
      board: String,
      school: String,
      year: Number,
      percentage: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    diploma: {
      institute: String,
      specialization: String,
      year: Number,
      percentage: Number
    }
  },
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    category: {
      type: String,
      enum: ['Programming', 'Framework', 'Database', 'Tool', 'Soft Skill', 'Other'],
      default: 'Other'
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  projects: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    technologies: [String],
    startDate: Date,
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false
    },
    projectUrl: String,
    githubUrl: String,
    role: String,
    teamSize: Number,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  internships: [{
    company: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    duration: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: Date,
      isOngoing: {
        type: Boolean,
        default: false
      }
    },
    description: {
      type: String,
      maxlength: [1000, 'Internship description cannot exceed 1000 characters']
    },
    technologies: [String],
    stipend: Number,
    certificateUrl: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: {
      type: String,
      required: true
    },
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    certificateUrl: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  achievements: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    date: Date,
    category: {
      type: String,
      enum: ['Academic', 'Technical', 'Sports', 'Cultural', 'Leadership', 'Other'],
      default: 'Other'
    },
    level: {
      type: String,
      enum: ['National', 'State', 'University', 'College', 'Other'],
      default: 'Other'
    },
    certificateUrl: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['marksheet', 'certificate', 'resume', 'id_proof', 'other'],
      required: true
    },
    name: String,
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationNotes: String
  }],
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  profileLocked: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'locked'],
    default: 'pending'
  },
  verificationNotes: String,
  placementStatus: {
    isPlaced: {
      type: Boolean,
      default: false
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    package: Number,
    placementDate: Date,
    jobRole: String
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  }],
  resumeVersions: [{
    version: Number,
    url: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: false
    },
    template: String
  }],
  firstLogin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  otpVerification: {
    emailOtp: String,
    phoneOtp: String,
    emailOtpExpiry: Date,
    phoneOtpExpiry: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for total applications
studentSchema.virtual('totalApplications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'student',
  count: true
});

// Indexes
studentSchema.index({ 'personalInfo.email': 1 });
studentSchema.index({ 'academicInfo.prnNumber': 1 });
studentSchema.index({ 'academicInfo.university': 1 });
studentSchema.index({ 'academicInfo.department': 1 });
studentSchema.index({ 'academicInfo.batch': 1 });
studentSchema.index({ 'academicInfo.cgpa': 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ verificationStatus: 1 });

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
studentSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if account is locked
studentSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
studentSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Method to get verification completion percentage
studentSchema.methods.getVerificationPercentage = function() {
  const sections = ['personalInfo', 'academicInfo', 'skills', 'projects'];
  let verifiedSections = 0;
  
  // Check each section for verification
  if (this.emailVerified && this.phoneVerified) verifiedSections++;
  if (this.academicInfo.cgpa && this.academicInfo.university) verifiedSections++;
  if (this.skills.length > 0) verifiedSections++;
  if (this.projects.length > 0) verifiedSections++;
  
  return Math.round((verifiedSections / sections.length) * 100);
};

const Student = mongoose.model('Student', studentSchema);

export default Student;

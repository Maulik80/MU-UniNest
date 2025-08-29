import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  companyDetails: {
    sector: {
      type: String,
      required: [true, 'Company sector is required'],
      enum: ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'Education', 'Government', 'Startup', 'Other']
    },
    registrationId: {
      type: String,
      required: [true, 'Registration ID is required'],
      unique: true
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL']
    },
    logo: {
      type: String,
      default: null
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    employeeCount: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year must be after 1800'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future']
    }
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
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required']
    },
    email: {
      type: String,
      required: [true, 'Contact person email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Contact person phone is required'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    designation: String
  },
  hrContacts: [{
    name: String,
    email: String,
    phone: String,
    designation: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['registration_certificate', 'tax_document', 'other']
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],
  partnerships: [{
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'terminated'],
      default: 'pending'
    },
    startDate: Date,
    endDate: Date,
    permissions: {
      canViewUnverifiedProfiles: {
        type: Boolean,
        default: false
      },
      canDownloadResumes: {
        type: Boolean,
        default: true
      },
      canCreateDrives: {
        type: Boolean,
        default: true
      }
    }
  }],
  placementDrives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive'
  }],
  aiPreferences: {
    useSmartScreening: {
      type: Boolean,
      default: true
    },
    screeningCriteria: {
      minimumCGPA: {
        type: Number,
        min: 0,
        max: 10,
        default: 6.0
      },
      preferredSkills: [String],
      experienceRequired: {
        type: String,
        enum: ['fresher', '0-1', '1-3', '3-5', '5+'],
        default: 'fresher'
      }
    },
    useOfferEmailGenerator: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalDrives: {
      type: Number,
      default: 0
    },
    totalHires: {
      type: Number,
      default: 0
    },
    averageHiringTime: {
      type: Number,
      default: 0
    },
    lastYearHires: {
      type: Number,
      default: 0
    }
  },
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
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for active drives
companySchema.virtual('activeDrives', {
  ref: 'PlacementDrive',
  localField: '_id',
  foreignField: 'company',
  match: { status: 'active' },
  count: true
});

// Virtual for total applications
companySchema.virtual('totalApplications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Indexes
companySchema.index({ email: 1 });
companySchema.index({ 'companyDetails.registrationId': 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ verificationStatus: 1 });
companySchema.index({ 'partnerships.university': 1 });

// Pre-save middleware to hash password
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
companySchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if account is locked
companySchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
companySchema.methods.incLoginAttempts = function() {
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

// Method to get partnership with university
companySchema.methods.getPartnershipWith = function(universityId) {
  return this.partnerships.find(p => p.university.toString() === universityId.toString());
};

// Method to check if company can access university
companySchema.methods.canAccessUniversity = function(universityId) {
  const partnership = this.getPartnershipWith(universityId);
  return partnership && partnership.status === 'active';
};

const Company = mongoose.model('Company', companySchema);

export default Company;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    maxlength: [200, 'University name cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'University code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'University code cannot exceed 10 characters']
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
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL']
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  accreditation: [{
    type: String,
    enum: ['NAAC', 'NBA', 'NIRF', 'UGC', 'AICTE', 'Other']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    allowCompaniesViewUnverified: {
      type: Boolean,
      default: false
    },
    resumeRules: {
      mandatoryFields: [{
        type: String,
        enum: ['cgpa', 'projects', 'certifications', 'internships', 'skills']
      }],
      allowedTemplates: [{
        type: String,
        default: 'default'
      }]
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  companies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  placementDrives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlacementDrive'
  }],
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

// Virtual for total students
universitySchema.virtual('totalStudents', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'university',
  count: true
});

// Virtual for active drives
universitySchema.virtual('activeDrives', {
  ref: 'PlacementDrive',
  localField: '_id',
  foreignField: 'university',
  match: { status: 'active' },
  count: true
});

// Indexes
universitySchema.index({ email: 1 });
universitySchema.index({ code: 1 });
universitySchema.index({ isActive: 1 });
universitySchema.index({ 'subscription.isActive': 1 });

// Pre-save middleware to hash password
universitySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
universitySchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if account is locked
universitySchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
universitySchema.methods.incLoginAttempts = function() {
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

const University = mongoose.model('University', universitySchema);

export default University;

import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    uppercase: true,
    trim: true,
    maxlength: [10, 'Department code cannot exceed 10 characters']
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University is required']
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  subDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  head: {
    name: String,
    email: String,
    phone: String,
    qualification: String
  },
  facultyAdmins: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: String,
    designation: String,
    permissions: {
      canManageStudents: {
        type: Boolean,
        default: true
      },
      canViewDrives: {
        type: Boolean,
        default: true
      },
      canApproveDrives: {
        type: Boolean,
        default: false
      },
      canManageClasses: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  classes: [{
    name: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    },
    section: {
      type: String,
      default: 'A'
    },
    classTeacher: {
      name: String,
      email: String,
      phone: String
    },
    studentCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  courses: [{
    name: {
      type: String,
      required: true,
      enum: ['B.Tech', 'M.Tech', 'B.E', 'M.E', 'BCA', 'MCA', 'MBA', 'B.Sc', 'M.Sc', 'Other']
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    totalSemesters: {
      type: Number,
      required: true,
      min: 2,
      max: 12
    },
    intake: {
      type: Number,
      default: 60
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  specializations: [{
    name: {
      type: String,
      required: true
    },
    code: String,
    description: String,
    applicableCourses: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  placementCoordinator: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  statistics: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalFaculty: {
      type: Number,
      default: 0
    },
    placementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averagePackage: {
      type: Number,
      default: 0
    },
    highestPackage: {
      type: Number,
      default: 0
    }
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  accreditation: [{
    type: String,
    enum: ['NBA', 'NAAC', 'UGC', 'AICTE', 'Other']
  }],
  facilities: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for hierarchical name
departmentSchema.virtual('fullName').get(function() {
  return this.parentDepartment ? `${this.name} (Sub-Department)` : this.name;
});

// Virtual for total students count
departmentSchema.virtual('totalStudentsCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'academicInfo.department',
  count: true
});

// Virtual for active drives count
departmentSchema.virtual('activeDrivesCount', {
  ref: 'PlacementDrive',
  localField: '_id',
  foreignField: 'eligibilityCriteria.departments',
  match: { status: 'active' },
  count: true
});

// Indexes
departmentSchema.index({ university: 1 });
departmentSchema.index({ code: 1, university: 1 }, { unique: true });
departmentSchema.index({ parentDepartment: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ displayOrder: 1 });

// Pre-save middleware to update statistics
departmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('classes')) {
    this.statistics.totalStudents = this.classes.reduce((total, cls) => total + cls.studentCount, 0);
  }
  next();
});

// Method to get department hierarchy
departmentSchema.methods.getHierarchy = async function() {
  const hierarchy = [];
  let current = this;
  
  while (current) {
    hierarchy.unshift({
      _id: current._id,
      name: current.name,
      code: current.code
    });
    
    if (current.parentDepartment) {
      current = await this.constructor.findById(current.parentDepartment);
    } else {
      current = null;
    }
  }
  
  return hierarchy;
};

// Method to check if user is faculty admin
departmentSchema.methods.isFacultyAdmin = function(email) {
  return this.facultyAdmins.some(admin => admin.email === email && admin.isActive);
};

// Method to get faculty admin permissions
departmentSchema.methods.getFacultyPermissions = function(email) {
  const admin = this.facultyAdmins.find(admin => admin.email === email && admin.isActive);
  return admin ? admin.permissions : null;
};

// Static method to find departments by university
departmentSchema.statics.findByUniversity = function(universityId) {
  return this.find({ university: universityId, isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .populate('subDepartments');
};

// Static method to find root departments (no parent)
departmentSchema.statics.findRootDepartments = function(universityId) {
  return this.find({ 
    university: universityId, 
    parentDepartment: null, 
    isActive: true 
  }).sort({ displayOrder: 1, name: 1 });
};

const Department = mongoose.model('Department', departmentSchema);

export default Department;

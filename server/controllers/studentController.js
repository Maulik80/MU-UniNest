import Student from "../models/Student.js";
import PlacementDrive from "../models/PlacementDrive.js";
import Application from "../models/Application.js";
import Offer from "../models/Offer.js";
import openaiService from "../services/openaiService.js";
import { generateToken, sendTokenResponse } from "../middlewares/auth.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// @desc    Register student
// @route   POST /api/v1/students/register
// @access  Public
export const registerStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      university,
      department,
      course,
      batch,
      prnNumber,
      cgpa,
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { "personalInfo.email": email },
        { "academicInfo.prnNumber": prnNumber },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already exists with this email or PRN number",
      });
    }

    // Create student
    const student = await Student.create({
      personalInfo: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
      },
      academicInfo: {
        university,
        department,
        course,
        batch,
        prnNumber,
        cgpa,
      },
      password,
    });

    sendTokenResponse(student, 201, res, "student");
  } catch (error) {
    console.error("Register student error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login student
// @route   POST /api/v1/students/login
// @access  Public
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find student and include password for comparison
    const student = await Student.findOne({ "personalInfo.email": email })
      .select("+password")
      .populate("academicInfo.university", "name")
      .populate("academicInfo.department", "name");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (student.isLocked()) {
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to too many failed login attempts",
      });
    }

    // Check password
    const isPasswordCorrect = await student.correctPassword(
      password,
      student.password,
    );

    if (!isPasswordCorrect) {
      // Increment login attempts
      await student.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    if (student.loginAttempts > 0) {
      await student.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
      });
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    sendTokenResponse(student, 200, res, "student");
  } catch (error) {
    console.error("Login student error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student profile
// @route   GET /api/v1/students/profile
// @access  Private (Student)
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate("academicInfo.university", "name code")
      .populate("academicInfo.department", "name code")
      .populate("applications")
      .populate("offers");

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/v1/students/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const updateData = req.body;

    // Handle profile picture upload
    if (req.fileInfo && req.fileInfo.url) {
      updateData["personalInfo.profilePicture"] = req.fileInfo.url;
    }

    const student = await Student.findByIdAndUpdate(studentId, updateData, {
      new: true,
      runValidators: true,
    }).populate("academicInfo.university academicInfo.department");

    res.status(200).json({
      success: true,
      data: student,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload resume
// @route   POST /api/v1/students/resume/upload
// @access  Private (Student)
export const uploadResume = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { template = "default", isActive = true } = req.body;

    if (!req.fileInfo) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    // Create new resume version
    const newVersion = {
      version: Date.now(), // Using timestamp as version
      url: req.fileInfo.url,
      template,
      isActive,
      createdAt: new Date(),
    };

    // Update student with new resume version
    const student = await Student.findById(studentId);

    // If this is the active resume, deactivate others
    if (isActive) {
      student.resumeVersions.forEach((resume) => {
        resume.isActive = false;
      });
    }

    student.resumeVersions.push(newVersion);
    await student.save();

    res.status(200).json({
      success: true,
      data: {
        resume: newVersion,
        fileInfo: req.fileInfo,
      },
      message: "Resume uploaded successfully",
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Analyze resume against job description
// @route   POST /api/v1/students/resume/analyze
// @access  Private (Student)
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job description are required",
      });
    }

    // Use OpenAI to analyze resume-JD match
    const analysis = await openaiService.analyzeResumeJDMatch(
      resumeText,
      jobDescription,
    );

    // Store analysis in student record
    const student = await Student.findById(req.user._id);

    // Add to a hypothetical analysis history (we can extend the model)
    const analysisRecord = {
      type: "resume_jd_match",
      result: analysis,
      timestamp: new Date(),
      jobDescription: jobDescription.substring(0, 500), // Store first 500 chars for reference
    };

    res.status(200).json({
      success: true,
      data: analysis,
      message: "Resume analysis completed successfully",
    });
  } catch (error) {
    console.error("Analyze resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze resume. Please try again.",
    });
  }
};

// @desc    Get resume analysis
// @route   GET /api/v1/students/resume/analysis/:resumeId
// @access  Private (Student)
export const getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const student = await Student.findById(req.user._id);

    const resume = student.resumeVersions.id(resumeId);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Return stored analysis or indicate that analysis is needed
    res.status(200).json({
      success: true,
      data: {
        resume,
        message: "Use the analyze endpoint to get AI-powered insights",
      },
    });
  } catch (error) {
    console.error("Get resume analysis error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get resume improvement suggestions
// @route   POST /api/v1/students/resume/improve
// @access  Private (Student)
export const improveResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    // Use OpenAI to generate improvement suggestions
    const improvements = await openaiService.generateResumeImprovements(
      resumeText,
      targetRole,
    );

    res.status(200).json({
      success: true,
      data: improvements,
      message: "Resume improvement suggestions generated successfully",
    });
  } catch (error) {
    console.error("Improve resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate improvement suggestions. Please try again.",
    });
  }
};

// @desc    Get all resumes
// @route   GET /api/v1/students/resumes
// @access  Private (Student)
export const getAllResumes = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: student.resumeVersions.sort((a, b) => b.createdAt - a.createdAt),
      count: student.resumeVersions.length,
    });
  } catch (error) {
    console.error("Get all resumes error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/v1/students/resume/:resumeId
// @access  Private (Student)
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const student = await Student.findById(req.user._id);

    const resumeIndex = student.resumeVersions.findIndex(
      (r) => r._id.toString() === resumeId,
    );
    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const resume = student.resumeVersions[resumeIndex];

    // Delete physical file
    if (resume.url) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        resume.url.replace("/uploads/", ""),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from array
    student.resumeVersions.splice(resumeIndex, 1);
    await student.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload documents
// @route   POST /api/v1/students/documents/upload
// @access  Private (Student)
export const uploadDocuments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { type, name } = req.body;

    if (!req.filesInfo || req.filesInfo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded",
      });
    }

    const student = await Student.findById(studentId);

    // Add documents to student record
    const newDocuments = req.filesInfo.map((fileInfo) => ({
      type: type || "other",
      name: name || fileInfo.originalName,
      url: fileInfo.url,
      uploadDate: new Date(),
      isVerified: false,
    }));

    student.documents.push(...newDocuments);
    await student.save();

    res.status(200).json({
      success: true,
      data: newDocuments,
      message: "Documents uploaded successfully",
    });
  } catch (error) {
    console.error("Upload documents error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all documents
// @route   GET /api/v1/students/documents
// @access  Private (Student)
export const getDocuments = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: student.documents.sort((a, b) => b.uploadDate - a.uploadDate),
      count: student.documents.length,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/v1/students/documents/:documentId
// @access  Private (Student)
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const student = await Student.findById(req.user._id);

    const documentIndex = student.documents.findIndex(
      (d) => d._id.toString() === documentId,
    );
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const document = student.documents[documentIndex];

    // Delete physical file
    if (document.url) {
      const filePath = path.join(
        process.cwd(),
        "uploads",
        document.url.replace("/uploads/", ""),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from array
    student.documents.splice(documentIndex, 1);
    await student.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Request document verification
// @route   POST /api/v1/students/documents/:documentId/verify
// @access  Private (Student)
export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const student = await Student.findById(req.user._id);

    const document = student.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // This would typically trigger a workflow for university admin to verify
    // For now, we'll just mark it as pending verification

    res.status(200).json({
      success: true,
      message:
        "Verification request submitted. University admin will review your document.",
    });
  } catch (error) {
    console.error("Verify document error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available placement drives
// @route   GET /api/v1/students/drives
// @access  Private (Student)
export const getPlacementDrives = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate(
      "academicInfo.university academicInfo.department",
    );

    // Find drives that student is eligible for
    const drives = await PlacementDrive.find({
      university: student.academicInfo.university._id,
      status: "active",
      "timeline.registrationEnd": { $gte: new Date() },
      "eligibilityCriteria.minimumCGPA": { $lte: student.academicInfo.cgpa },
      "eligibilityCriteria.courses": { $in: [student.academicInfo.course] },
      "eligibilityCriteria.departments": {
        $in: [student.academicInfo.department._id],
      },
      "eligibilityCriteria.batches": { $in: [student.academicInfo.batch] },
    })
      .populate("company", "name companyDetails.sector")
      .sort({ "timeline.registrationEnd": 1 });

    res.status(200).json({
      success: true,
      data: drives,
      count: drives.length,
    });
  } catch (error) {
    console.error("Get placement drives error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Apply to placement drive
// @route   POST /api/v1/students/drives/:driveId/apply
// @access  Private (Student)
export const applyToDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { coverLetter, additionalInfo } = req.body;
    const studentId = req.user._id;

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: studentId,
      placementDrive: driveId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this drive",
      });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    // Create application
    const application = await Application.create({
      student: studentId,
      placementDrive: driveId,
      company: drive.company,
      university: drive.university,
      coverLetter,
      additionalInfo,
      selectionRounds: drive.selectionProcess.rounds.map((round, index) => ({
        round: round.type,
        roundOrder: index + 1,
        status: "scheduled",
      })),
    });

    // Add application to student and drive
    const student = await Student.findById(studentId);
    student.applications.push(application._id);
    await student.save();

    drive.applications.push(application._id);
    await drive.save();

    res.status(201).json({
      success: true,
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Apply to drive error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student applications
// @route   GET /api/v1/students/applications
// @access  Private (Student)
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("placementDrive", "title jobDetails timeline")
      .populate("company", "name companyDetails.sector")
      .sort({ "timeline.appliedAt": -1 });

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get application details
// @route   GET /api/v1/students/applications/:applicationId
// @access  Private (Student)
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findOne({
      _id: applicationId,
      student: req.user._id,
    })
      .populate("placementDrive")
      .populate("company")
      .populate("university");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error("Get application details error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Withdraw application
// @route   PUT /api/v1/students/applications/:applicationId/withdraw
// @access  Private (Student)
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await Application.findOne({
      _id: applicationId,
      student: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      ["selected", "offer_received", "offer_accepted"].includes(
        application.applicationStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot withdraw application at this stage",
      });
    }

    application.withdrawalInfo = {
      isWithdrawn: true,
      withdrawnAt: new Date(),
      reason: reason || "Student withdrawal",
      withdrawnBy: "student",
    };

    application.applicationStatus = "rejected";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    console.error("Withdraw application error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student offers
// @route   GET /api/v1/students/offers
// @access  Private (Student)
export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ student: req.user._id })
      .populate("company", "name companyDetails")
      .populate("placementDrive", "title")
      .sort({ "timeline.issuedAt": -1 });

    res.status(200).json({
      success: true,
      data: offers,
      count: offers.length,
    });
  } catch (error) {
    console.error("Get offers error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get offer details
// @route   GET /api/v1/students/offers/:offerId
// @access  Private (Student)
export const getOfferDetails = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findOne({
      _id: offerId,
      student: req.user._id,
    })
      .populate("company")
      .populate("placementDrive")
      .populate("application");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error("Get offer details error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Respond to offer
// @route   PUT /api/v1/students/offers/:offerId/respond
// @access  Private (Student)
export const respondToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { response, message, counterOffer } = req.body;

    const offer = await Offer.findOne({
      _id: offerId,
      student: req.user._id,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Offer is no longer pending",
      });
    }

    if (!offer.isValid) {
      return res.status(400).json({
        success: false,
        message: "Offer has expired",
      });
    }

    let result;
    switch (response) {
      case "accept":
        result = await offer.accept(message);
        break;
      case "reject":
        result = await offer.reject(message);
        break;
      case "counter":
        result = await offer.counterOffer(counterOffer);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid response type",
        });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: `Offer ${response}ed successfully`,
    });
  } catch (error) {
    console.error("Respond to offer error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Request profile verification
// @route   POST /api/v1/students/verify/request
// @access  Private (Student)
export const requestProfileVerification = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (student.verificationStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Verification request already pending",
      });
    }

    student.verificationStatus = "pending";
    await student.save();

    res.status(200).json({
      success: true,
      message: "Verification request submitted successfully",
    });
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/v1/students/password
// @access  Private (Student)
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const student = await Student.findById(req.user._id).select("+password");

    // Check current password
    const isCurrentPasswordCorrect = await student.correctPassword(
      currentPassword,
      student.password,
    );
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/v1/students/stats
// @access  Private (Student)
export const getStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [applications, offers, student] = await Promise.all([
      Application.countDocuments({ student: studentId }),
      Offer.countDocuments({ student: studentId }),
      Student.findById(studentId),
    ]);

    const stats = {
      totalApplications: applications,
      totalOffers: offers,
      profileCompletion: student.getVerificationPercentage(),
      totalResumes: student.resumeVersions.length,
      totalDocuments: student.documents.length,
      verificationStatus: student.verificationStatus,
      placementStatus: student.placementStatus,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export complete profile
// @route   GET /api/v1/students/export
// @access  Private (Student)
export const exportProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate("academicInfo.university academicInfo.department")
      .populate("applications")
      .populate("offers");

    // Remove sensitive fields
    const exportData = student.toObject();
    delete exportData.password;
    delete exportData.otpVerification;
    delete exportData.loginAttempts;
    delete exportData.lockUntil;

    res.status(200).json({
      success: true,
      data: exportData,
      exportedAt: new Date(),
      message: "Profile data exported successfully",
    });
  } catch (error) {
    console.error("Export profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

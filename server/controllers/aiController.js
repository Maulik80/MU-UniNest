import openaiService from "../services/openaiService.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import PlacementDrive from "../models/PlacementDrive.js";
import Application from "../models/Application.js";
import Offer from "../models/Offer.js";

// @desc    Analyze resume against job description
// @route   POST /api/v1/ai/resume/analyze
// @access  Private (Student, University, Company)
export const analyzeResumeJD = async (req, res) => {
  try {
    const { resumeText, jobDescription, saveAnalysis = false } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job description are required",
      });
    }

    // Analyze using OpenAI
    const analysis = await openaiService.analyzeResumeJDMatch(
      resumeText,
      jobDescription,
    );

    // If student is analyzing their own resume, optionally save the analysis
    if (req.userType === "student" && saveAnalysis) {
      const student = await Student.findById(req.user._id);
      // We could extend the Student model to store analysis history
      // For now, we'll just return the analysis
    }

    res.status(200).json({
      success: true,
      data: {
        analysis,
        timestamp: new Date(),
        creditsUsed: 1, // Track AI usage for billing
      },
      message: "Resume analysis completed successfully",
    });
  } catch (error) {
    console.error("AI Resume Analysis Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to analyze resume. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Generate resume improvement suggestions
// @route   POST /api/v1/ai/resume/improve
// @access  Private (Student, University)
export const generateResumeImprovements = async (req, res) => {
  try {
    const { resumeText, targetRole, includeFormatting = true } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    // Generate improvements using OpenAI
    const improvements = await openaiService.generateResumeImprovements(
      resumeText,
      targetRole,
    );

    res.status(200).json({
      success: true,
      data: {
        improvements,
        targetRole: targetRole || "General",
        timestamp: new Date(),
        creditsUsed: 1,
      },
      message: "Resume improvement suggestions generated successfully",
    });
  } catch (error) {
    console.error("AI Resume Improvement Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to generate improvement suggestions. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Screen candidate using AI
// @route   POST /api/v1/ai/candidate/screen
// @access  Private (Company, University)
export const screenCandidate = async (req, res) => {
  try {
    const { candidateId, jobRequirements, driveId } = req.body;

    if (!candidateId || !jobRequirements) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID and job requirements are required",
      });
    }

    // Get candidate profile
    const candidate = await Student.findById(candidateId).populate(
      "academicInfo.university academicInfo.department",
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Prepare candidate profile for AI analysis
    const candidateProfile = {
      personalInfo: candidate.personalInfo,
      academicInfo: candidate.academicInfo,
      skills: candidate.skills,
      projects: candidate.projects,
      internships: candidate.internships,
      certifications: candidate.certifications,
      achievements: candidate.achievements,
    };

    // Screen using OpenAI
    const screening = await openaiService.screenCandidate(
      candidateProfile,
      jobRequirements,
    );

    // If this is for a specific drive, save the screening result
    if (driveId) {
      const drive = await PlacementDrive.findById(driveId);
      if (
        drive &&
        req.userType === "company" &&
        drive.company.equals(req.user._id)
      ) {
        // Update the drive with AI screening results
        const existingCandidate = drive.aiInsights.recommendedStudents.find(
          (s) => s.student.equals(candidateId),
        );

        if (existingCandidate) {
          existingCandidate.score = screening.fitScore;
          existingCandidate.reasons = screening.strengths;
        } else {
          drive.aiInsights.recommendedStudents.push({
            student: candidateId,
            score: screening.fitScore,
            reasons: screening.strengths,
            generatedAt: new Date(),
          });
        }

        await drive.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        candidateId,
        screening,
        timestamp: new Date(),
        creditsUsed: 1,
      },
      message: "Candidate screening completed successfully",
    });
  } catch (error) {
    console.error("AI Candidate Screening Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to screen candidate. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Generate student recommendations for placement drive
// @route   POST /api/v1/ai/students/recommend
// @access  Private (University, Company)
export const generateStudentRecommendations = async (req, res) => {
  try {
    const { driveId, limit = 10, minCGPA, departments, skills } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        message: "Drive ID is required",
      });
    }

    // Get placement drive details
    const drive =
      await PlacementDrive.findById(driveId).populate("company university");

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Placement drive not found",
      });
    }

    // Build filter criteria
    const filterCriteria = {
      "academicInfo.university": drive.university._id,
      "academicInfo.cgpa": {
        $gte: minCGPA || drive.eligibilityCriteria.minimumCGPA,
      },
      isActive: true,
      verificationStatus: { $ne: "rejected" },
    };

    if (departments && departments.length > 0) {
      filterCriteria["academicInfo.department"] = { $in: departments };
    } else if (drive.eligibilityCriteria.departments.length > 0) {
      filterCriteria["academicInfo.department"] = {
        $in: drive.eligibilityCriteria.departments,
      };
    }

    if (drive.eligibilityCriteria.courses.length > 0) {
      filterCriteria["academicInfo.course"] = {
        $in: drive.eligibilityCriteria.courses,
      };
    }

    if (drive.eligibilityCriteria.batches.length > 0) {
      filterCriteria["academicInfo.batch"] = {
        $in: drive.eligibilityCriteria.batches,
      };
    }

    // Get eligible students
    const students = await Student.find(filterCriteria)
      .populate("academicInfo.department", "name")
      .limit(limit * 2) // Get more students to allow AI to filter
      .lean();

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: [],
          summary: "No eligible students found matching the criteria",
        },
        message: "No students found matching the criteria",
      });
    }

    // Prepare data for AI analysis
    const jobDescription = drive.jobDetails.jobDescription;
    const driveRequirements = {
      role: drive.jobDetails.role,
      skillsRequired: drive.jobDetails.skillsRequired,
      experienceRequired: drive.jobDetails.experienceRequired,
      minimumCGPA: drive.eligibilityCriteria.minimumCGPA,
      eligibleDepartments: drive.eligibilityCriteria.departments,
      location: drive.jobDetails.locations,
    };

    // Generate recommendations using OpenAI
    const recommendations = await openaiService.generateStudentRecommendations(
      students,
      jobDescription,
      driveRequirements,
    );

    // Update drive with AI insights
    drive.aiInsights.recommendedStudents = recommendations.recommendations.map(
      (rec) => ({
        student: rec.studentId,
        score: rec.fitScore,
        reasons: rec.reasons,
        generatedAt: new Date(),
      }),
    );
    drive.aiInsights.analysisComplete = true;
    drive.aiInsights.lastAnalysis = new Date();
    await drive.save();

    res.status(200).json({
      success: true,
      data: {
        driveId,
        recommendations: recommendations.recommendations.slice(0, limit),
        summary: recommendations.summary,
        insights: recommendations.insights,
        totalStudentsAnalyzed: students.length,
        timestamp: new Date(),
        creditsUsed: Math.ceil(students.length / 10), // Rough estimate
      },
      message: "Student recommendations generated successfully",
    });
  } catch (error) {
    console.error("AI Student Recommendations Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to generate student recommendations. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Generate offer email content
// @route   POST /api/v1/ai/offer/email/generate
// @access  Private (Company, University)
export const generateOfferEmail = async (req, res) => {
  try {
    const { offerId, tone = "professional", includeDetails = true } = req.body;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required",
      });
    }

    // Get offer details
    const offer = await Offer.findById(offerId).populate(
      "student company placementDrive",
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Verify access rights
    if (req.userType === "company" && !offer.company._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Prepare data for AI email generation
    const offerDetails = {
      jobTitle: offer.offerDetails.jobTitle,
      company: offer.company.name,
      location: offer.offerDetails.location,
      package: offer.compensation.totalPackage,
      joiningDate: offer.offerDetails.joiningDate,
      bondPeriod: offer.terms.bondPeriod,
    };

    const studentProfile = {
      fullName: offer.student.fullName,
      email: offer.student.personalInfo.email,
    };

    const companyInfo = {
      name: offer.company.name,
      sector: offer.company.companyDetails.sector,
      website: offer.company.companyDetails.website,
    };

    // Generate email using OpenAI
    const emailContent = await openaiService.generateOfferEmail(
      offerDetails,
      studentProfile,
      companyInfo,
    );

    // Mark as AI generated
    offer.aiGeneration = {
      wasAIGenerated: true,
      template: "email_offer",
      generatedAt: new Date(),
      generatedBy: req.user._id,
      generatedByModel: req.userType === "company" ? "Company" : "University",
    };
    await offer.save();

    res.status(200).json({
      success: true,
      data: {
        offerId,
        emailContent,
        timestamp: new Date(),
        creditsUsed: 1,
      },
      message: "Offer email content generated successfully",
    });
  } catch (error) {
    console.error("AI Offer Email Generation Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to generate offer email. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Generate placement insights and analytics
// @route   POST /api/v1/ai/insights/placement
// @access  Private (University, Admin)
export const generatePlacementInsights = async (req, res) => {
  try {
    const {
      universityId,
      timeRange = "1year",
      includeComparisons = true,
    } = req.body;

    // If no university ID provided, use current user's university
    const targetUniversityId = universityId || req.user._id;

    // Get placement data for the specified time range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "6months":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "2years":
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // Aggregate placement data
    const [drives, applications, offers, students] = await Promise.all([
      PlacementDrive.find({
        university: targetUniversityId,
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("company", "name companyDetails.sector"),

      Application.find({
        university: targetUniversityId,
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("student", "academicInfo"),

      Offer.find({
        university: targetUniversityId,
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      Student.find({
        "academicInfo.university": targetUniversityId,
        "placementStatus.isPlaced": true,
        "placementStatus.placementDate": { $gte: startDate, $lte: endDate },
      }),
    ]);

    // Prepare placement data for AI analysis
    const placementData = {
      totalDrives: drives.length,
      totalApplications: applications.length,
      totalOffers: offers.length,
      totalPlacements: students.length,

      // Department-wise breakdown
      departmentStats: applications.reduce((acc, app) => {
        const dept = app.student.academicInfo.department;
        if (!acc[dept]) acc[dept] = { applications: 0, placements: 0 };
        acc[dept].applications++;
        return acc;
      }, {}),

      // Company sectors
      companySectors: drives.reduce((acc, drive) => {
        const sector = drive.company.companyDetails.sector;
        acc[sector] = (acc[sector] || 0) + 1;
        return acc;
      }, {}),

      // Package distribution
      packageStats: {
        averagePackage:
          offers.reduce(
            (sum, offer) => sum + offer.compensation.totalPackage,
            0,
          ) / offers.length,
        highestPackage: Math.max(
          ...offers.map((o) => o.compensation.totalPackage),
        ),
        lowestPackage: Math.min(
          ...offers.map((o) => o.compensation.totalPackage),
        ),
      },

      timeRange,
      analysisDate: new Date(),
    };

    // University statistics for context
    const universityStats = {
      totalStudents: await Student.countDocuments({
        "academicInfo.university": targetUniversityId,
      }),
      activeStudents: await Student.countDocuments({
        "academicInfo.university": targetUniversityId,
        isActive: true,
      }),
      placementRate:
        (students.length /
          (await Student.countDocuments({
            "academicInfo.university": targetUniversityId,
          }))) *
        100,
    };

    // Generate insights using OpenAI
    const insights = await openaiService.generatePlacementInsights(
      placementData,
      universityStats,
    );

    res.status(200).json({
      success: true,
      data: {
        placementData,
        universityStats,
        insights,
        timeRange,
        timestamp: new Date(),
        creditsUsed: 2, // More complex analysis
      },
      message: "Placement insights generated successfully",
    });
  } catch (error) {
    console.error("AI Placement Insights Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to generate placement insights. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Extract structured data from resume
// @route   POST /api/v1/ai/resume/extract
// @access  Private (Student, University)
export const extractResumeData = async (req, res) => {
  try {
    const { resumeText, studentId } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    // Extract structured data using OpenAI
    const extractedData = await openaiService.extractResumeData(resumeText);

    // If student ID is provided and user is authorized, update student profile
    if (
      studentId &&
      (req.userType === "university" ||
        (req.userType === "student" && req.user._id.toString() === studentId))
    ) {
      const student = await Student.findById(studentId);
      if (student) {
        // Update student profile with extracted data (selectively)
        if (extractedData.skills && extractedData.skills.length > 0) {
          const newSkills = extractedData.skills.map((skill) => ({
            name: skill,
            level: "Intermediate",
            category: "Other",
            isVerified: false,
          }));

          // Merge with existing skills (avoid duplicates)
          const existingSkillNames = student.skills.map((s) =>
            s.name.toLowerCase(),
          );
          const uniqueNewSkills = newSkills.filter(
            (skill) => !existingSkillNames.includes(skill.name.toLowerCase()),
          );

          student.skills.push(...uniqueNewSkills);
        }

        // Update projects
        if (extractedData.projects && extractedData.projects.length > 0) {
          const newProjects = extractedData.projects.map((project) => ({
            title: project.title,
            description: project.description,
            technologies: project.technologies || [],
            isVerified: false,
          }));

          student.projects.push(...newProjects);
        }

        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        extractedData,
        timestamp: new Date(),
        creditsUsed: 1,
      },
      message: "Resume data extracted successfully",
    });
  } catch (error) {
    console.error("AI Resume Extraction Error:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to extract resume data. AI service may be temporarily unavailable.",
    });
  }
};

// @desc    Get AI usage statistics
// @route   GET /api/v1/ai/usage/stats
// @access  Private (University, Admin)
export const getAIUsageStats = async (req, res) => {
  try {
    // This would track AI API usage, costs, etc.
    // For now, return placeholder data
    const stats = {
      totalRequests: 0,
      creditsUsed: 0,
      mostUsedFeatures: [
        { feature: "Resume Analysis", usage: 0 },
        { feature: "Student Recommendations", usage: 0 },
        { feature: "Candidate Screening", usage: 0 },
      ],
      monthlyUsage: [],
      lastUpdated: new Date(),
    };

    res.status(200).json({
      success: true,
      data: stats,
      message: "AI usage statistics retrieved successfully",
    });
  } catch (error) {
    console.error("AI Usage Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve AI usage statistics",
    });
  }
};

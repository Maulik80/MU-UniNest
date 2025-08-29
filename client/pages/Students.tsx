import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  Brain,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Briefcase,
  Award,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Building,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  Send,
  Plus,
  Edit,
  Save,
} from "lucide-react";

export default function Students() {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91-9876543210",
    cgpa: 8.5,
    university: "MSU Baroda",
    department: "Computer Science",
    batch: "2024",
  });
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState(null);

  const fileInputRef = useRef(null);

  // Mock data
  const mockResumes = [
    {
      id: 1,
      name: "Resume_V1.pdf",
      uploadDate: "2024-01-15",
      isActive: true,
      template: "Professional",
      size: "245 KB",
    },
    {
      id: 2,
      name: "Resume_V2.pdf",
      uploadDate: "2024-01-20",
      isActive: false,
      template: "Modern",
      size: "312 KB",
    },
  ];

  const mockApplications = [
    {
      id: 1,
      company: "TCS",
      role: "Software Engineer",
      status: "under_review",
      appliedDate: "2024-01-10",
      package: "6.5 LPA",
    },
    {
      id: 2,
      company: "Infosys",
      role: "System Engineer",
      status: "shortlisted",
      appliedDate: "2024-01-12",
      package: "7.2 LPA",
    },
  ];

  const mockOffers = [
    {
      id: 1,
      company: "Wipro",
      role: "Software Developer",
      status: "pending",
      package: "8.0 LPA",
      expiryDate: "2024-02-15",
    },
  ];

  const stats = {
    profileCompletion: 85,
    totalApplications: 5,
    totalOffers: 1,
    totalResumes: 2,
    placementStatus: "Active",
  };

  // Handlers
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        uploadDate: new Date().toISOString().split("T")[0],
        isActive: uploadedFiles.length === 0 && index === 0,
        template: "Professional",
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Show success message
      alert("Resume uploaded successfully!");
    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResumeAnalysis = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please provide both resume text and job description");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockAnalysis = {
        compatibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        keywordMatches: ["JavaScript", "React", "Node.js", "SQL", "Git"],
        missingKeywords: ["TypeScript", "Docker", "AWS", "MongoDB"],
        strengths: [
          "Strong programming fundamentals",
          "Good project experience",
          "Relevant internship experience",
        ],
        gaps: [
          "Limited cloud platform experience",
          "No DevOps experience mentioned",
          "Could improve system design knowledge",
        ],
        recommendations: [
          "Add cloud certifications (AWS/Azure)",
          "Include more backend project details",
          "Highlight problem-solving examples",
          "Add metrics to quantify achievements",
        ],
        summary:
          "Good candidate with solid technical foundation. Strong in web development with room for growth in cloud technologies.",
      };

      setAnalysisResults(mockAnalysis);
    } catch (error) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetImprovements = async () => {
    if (!resumeText) {
      alert("Please provide resume text");
      return;
    }

    try {
      // Simulate AI improvement suggestions
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockImprovements = {
        overallScore: 75,
        improvements: [
          {
            section: "Summary",
            current: "Basic objective statement",
            suggested:
              "Dynamic professional summary highlighting key achievements",
            reason: "Makes stronger first impression",
            priority: "high",
          },
          {
            section: "Experience",
            current: "Listed responsibilities",
            suggested: "Quantified achievements with metrics",
            reason: "Shows impact and results",
            priority: "high",
          },
          {
            section: "Skills",
            current: "Basic skill list",
            suggested: "Categorized skills with proficiency levels",
            reason: "Better organization and clarity",
            priority: "medium",
          },
        ],
        missingElements: ["Certifications section", "Projects portfolio links"],
        atsOptimization: [
          "Use standard section headers",
          "Include more keywords",
        ],
        keywordSuggestions: [
          "Machine Learning",
          "API Development",
          "Agile",
          "Testing",
        ],
      };

      setImprovementSuggestions(mockImprovements);
    } catch (error) {
      alert("Failed to get improvement suggestions");
    }
  };

  const deleteResume = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    alert("Resume deleted successfully");
  };

  const setActiveResume = (id) => {
    setUploadedFiles((prev) =>
      prev.map((file) => ({
        ...file,
        isActive: file.id === id,
      })),
    );
    alert("Active resume updated");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-uninest-navy mb-2">
            Student Dashboard
          </h1>
          <p className="text-uninest-gray">
            Manage your placement journey with AI-powered tools
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-uninest-blue" />
                <div>
                  <p className="text-sm text-uninest-gray">Profile</p>
                  <p className="text-2xl font-bold">
                    {stats.profileCompletion}%
                  </p>
                </div>
              </div>
              <Progress value={stats.profileCompletion} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-uninest-gray">Applications</p>
                  <p className="text-2xl font-bold">
                    {stats.totalApplications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-uninest-gray">Offers</p>
                  <p className="text-2xl font-bold">{stats.totalOffers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-uninest-gray">Resumes</p>
                  <p className="text-2xl font-bold">{stats.totalResumes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-uninest-blue" />
                <div>
                  <p className="text-sm text-uninest-gray">Status</p>
                  <p className="text-sm font-semibold text-green-600">
                    {stats.placementStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Resume uploaded</p>
                        <p className="text-xs text-uninest-gray">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">
                          Applied to TCS drive
                        </p>
                        <p className="text-xs text-uninest-gray">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-uninest-gray">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab("resume")}
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Upload Resume</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab("analysis")}
                    >
                      <Brain className="h-5 w-5" />
                      <span className="text-xs">AI Analysis</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab("applications")}
                    >
                      <Send className="h-5 w-5" />
                      <span className="text-xs">View Applications</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab("profile")}
                    >
                      <Edit className="h-5 w-5" />
                      <span className="text-xs">Edit Profile</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Keep your profile updated for better opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      value={profile.cgpa}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          cgpa: parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch</Label>
                    <Input
                      id="batch"
                      value={profile.batch}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          batch: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Resume</span>
                </CardTitle>
                <CardDescription>
                  Upload your resume in PDF or DOC format (Max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-4"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resumes List */}
            <Card>
              <CardHeader>
                <CardTitle>My Resumes</CardTitle>
                <CardDescription>Manage your uploaded resumes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...mockResumes, ...uploadedFiles].map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-uninest-blue" />
                        <div>
                          <h4 className="font-medium">{resume.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Uploaded: {resume.uploadDate}</span>
                            <span>Size: {resume.size}</span>
                            <span>Template: {resume.template}</span>
                          </div>
                        </div>
                        {resume.isActive && (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {!resume.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveResume(resume.id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteResume(resume.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {mockResumes.length === 0 && uploadedFiles.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No resumes uploaded yet</p>
                      <p className="text-sm">
                        Upload your first resume to get started
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Resume-JD Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Resume-JD Analysis</span>
                </CardTitle>
                <CardDescription>
                  Analyze how well your resume matches a specific job
                  description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="resumeText">Resume Text</Label>
                    <Textarea
                      id="resumeText"
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={8}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleResumeAnalysis}
                    disabled={isAnalyzing || !resumeText || !jobDescription}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analyze Match
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleGetImprovements}
                    disabled={!resumeText}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Get Improvements
                  </Button>
                </div>

                {/* Analysis Results */}
                {analysisResults && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Analysis Results</h3>

                    {/* Compatibility Score */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium">
                            Compatibility Score
                          </h4>
                          <Badge
                            className={`text-lg px-3 py-1 ${
                              analysisResults.compatibilityScore >= 80
                                ? "bg-green-100 text-green-800"
                                : analysisResults.compatibilityScore >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {analysisResults.compatibilityScore}%
                          </Badge>
                        </div>
                        <Progress
                          value={analysisResults.compatibilityScore}
                          className="mb-2"
                        />
                        <p className="text-sm text-gray-600">
                          {analysisResults.summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Keyword Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-green-700">
                            Matched Keywords
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.keywordMatches.map(
                              (keyword, index) => (
                                <Badge
                                  key={index}
                                  className="bg-green-100 text-green-800"
                                >
                                  {keyword}
                                </Badge>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base text-red-700">
                            Missing Keywords
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.missingKeywords.map(
                              (keyword, index) => (
                                <Badge
                                  key={index}
                                  className="bg-red-100 text-red-800"
                                >
                                  {keyword}
                                </Badge>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Strengths and Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Strengths</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.strengths.map(
                              (strength, index) => (
                                <li
                                  key={index}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                  <span className="text-sm">{strength}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Areas for Improvement</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.gaps.map((gap, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <span className="text-sm">{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          AI Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResults.recommendations.map(
                            (recommendation, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-3"
                              >
                                <div className="w-6 h-6 bg-uninest-blue text-white rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-sm">
                                  {recommendation}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {improvementSuggestions && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Improvement Suggestions
                    </h3>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Overall Resume Score</span>
                          <Badge className="text-lg px-3 py-1 bg-blue-100 text-blue-800">
                            {improvementSuggestions.overallScore}/100
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress
                          value={improvementSuggestions.overallScore}
                          className="mb-4"
                        />

                        <div className="space-y-4">
                          {improvementSuggestions.improvements.map(
                            (improvement, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">
                                    {improvement.section}
                                  </h4>
                                  <Badge
                                    className={
                                      improvement.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : improvement.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }
                                  >
                                    {improvement.priority} priority
                                  </Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium text-red-600">
                                      Current:{" "}
                                    </span>
                                    <span>{improvement.current}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600">
                                      Suggested:{" "}
                                    </span>
                                    <span>{improvement.suggested}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-blue-600">
                                      Why:{" "}
                                    </span>
                                    <span>{improvement.reason}</span>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Missing Elements */}
                        {improvementSuggestions.missingElements.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">
                              Missing Elements
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {improvementSuggestions.missingElements.map(
                                (element, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-orange-700 border-orange-200"
                                  >
                                    {element}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Keyword Suggestions */}
                        {improvementSuggestions.keywordSuggestions.length >
                          0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">
                              Suggested Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {improvementSuggestions.keywordSuggestions.map(
                                (keyword, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-purple-700 border-purple-200"
                                  >
                                    {keyword}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>
                  Track your placement drive applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {application.company}
                          </h4>
                          <p className="text-uninest-gray">
                            {application.role}
                          </p>
                        </div>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-uninest-gray">Applied: </span>
                          <span>{application.appliedDate}</span>
                        </div>
                        <div>
                          <span className="text-uninest-gray">Package: </span>
                          <span className="font-medium">
                            {application.package}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Offers</CardTitle>
                <CardDescription>
                  Manage your job offers and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOffers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {offer.company}
                          </h4>
                          <p className="text-uninest-gray">{offer.role}</p>
                        </div>
                        <Badge className={getStatusColor(offer.status)}>
                          {offer.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-uninest-gray">Package: </span>
                          <span className="font-semibold text-lg">
                            {offer.package}
                          </span>
                        </div>
                        <div>
                          <span className="text-uninest-gray">Expires: </span>
                          <span>{offer.expiryDate}</span>
                        </div>
                      </div>

                      {offer.status === "pending" && (
                        <div className="flex space-x-3 pt-4 border-t">
                          <Button className="flex-1" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Offer
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Negotiate
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {mockOffers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No offers received yet</p>
                      <p className="text-sm">
                        Keep applying to get your dream job!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

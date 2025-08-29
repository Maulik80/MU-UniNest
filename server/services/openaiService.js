import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  /**
   * Analyze resume against job description for compatibility
   */
  async analyzeResumeJDMatch(resumeText, jobDescription) {
    try {
      const prompt = `
        Analyze the following resume against the job description and provide a detailed matching analysis.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Please provide a JSON response with the following structure:
        {
          "compatibilityScore": <number between 0-100>,
          "keywordMatches": [<array of matched keywords/skills>],
          "missingKeywords": [<array of important keywords missing from resume>],
          "strengths": [<array of candidate strengths for this role>],
          "gaps": [<array of skill/experience gaps>],
          "recommendations": [<array of specific improvement suggestions>],
          "summary": "<brief summary of candidate fit>",
          "reasoning": "<detailed explanation of the score>"
        }
        
        Focus on technical skills, experience level, education, and role requirements.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert HR analyst and ATS system specializing in resume-job description matching. Provide accurate, detailed analysis in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in analyzeResumeJDMatch:", error);
      throw new Error("Failed to analyze resume-JD match");
    }
  }

  /**
   * Generate resume improvement suggestions
   */
  async generateResumeImprovements(resumeText, targetRole = "") {
    try {
      const prompt = `
        Analyze the following resume and provide specific improvement suggestions to make it more compelling and ATS-friendly.
        ${targetRole ? `Target Role: ${targetRole}` : ""}
        
        RESUME:
        ${resumeText}
        
        Please provide a JSON response with the following structure:
        {
          "overallScore": <number between 0-100>,
          "improvements": [
            {
              "section": "<section name>",
              "current": "<current content issue>",
              "suggested": "<improved version>",
              "reason": "<why this improvement helps>",
              "priority": "<high/medium/low>"
            }
          ],
          "missingElements": [<array of important missing resume elements>],
          "atsOptimization": [<array of ATS-specific improvements>],
          "formattingTips": [<array of formatting suggestions>],
          "keywordSuggestions": [<array of relevant keywords to add>],
          "summary": "<overall improvement summary>"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional resume writer and career coach. Provide actionable, specific improvement suggestions in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in generateResumeImprovements:", error);
      throw new Error("Failed to generate resume improvements");
    }
  }

  /**
   * Smart candidate screening for companies
   */
  async screenCandidate(candidateProfile, jobRequirements) {
    try {
      const prompt = `
        Analyze the following candidate profile against job requirements and provide a comprehensive screening report.
        
        CANDIDATE PROFILE:
        ${JSON.stringify(candidateProfile, null, 2)}
        
        JOB REQUIREMENTS:
        ${JSON.stringify(jobRequirements, null, 2)}
        
        Please provide a JSON response with the following structure:
        {
          "fitScore": <number between 0-100>,
          "summary": "<1-2 sentence candidate summary>",
          "strengths": [<array of key strengths for this role>],
          "concerns": [<array of potential concerns or gaps>],
          "recommendation": "<hire/interview/reject with reasoning>",
          "interviewFocus": [<array of areas to focus on during interview>],
          "salaryFit": "<assessment of candidate's expected salary vs budget>",
          "cultureFit": "<assessment of potential culture fit>",
          "skillAssessment": {
            "technical": <score 0-100>,
            "experience": <score 0-100>,
            "education": <score 0-100>,
            "overall": <score 0-100>
          }
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical recruiter and hiring manager. Provide thorough, unbiased candidate assessments in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1800,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in screenCandidate:", error);
      throw new Error("Failed to screen candidate");
    }
  }

  /**
   * Generate AI-powered student recommendations for placement drives
   */
  async generateStudentRecommendations(
    students,
    jobDescription,
    driveRequirements,
  ) {
    try {
      const prompt = `
        Analyze the following students for a placement drive and rank them by fit score.
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        DRIVE REQUIREMENTS:
        ${JSON.stringify(driveRequirements, null, 2)}
        
        STUDENTS:
        ${JSON.stringify(students.slice(0, 10), null, 2)} // Limit to prevent token overflow
        
        Please provide a JSON response with the following structure:
        {
          "recommendations": [
            {
              "studentId": "<student ID>",
              "fitScore": <number between 0-100>,
              "reasons": [<array of reasons why this student is a good fit>],
              "concerns": [<array of potential concerns>],
              "ranking": <overall ranking position>
            }
          ],
          "summary": "<overall analysis of the candidate pool>",
          "insights": [<array of insights about the students for this role>]
        }
        
        Sort recommendations by fitScore in descending order.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI placement coordinator specializing in matching students to job opportunities. Provide fair, unbiased rankings in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in generateStudentRecommendations:", error);
      throw new Error("Failed to generate student recommendations");
    }
  }

  /**
   * Generate offer email content
   */
  async generateOfferEmail(offerDetails, studentProfile, companyInfo) {
    try {
      const prompt = `
        Generate a professional offer letter email for the following details:
        
        OFFER DETAILS:
        ${JSON.stringify(offerDetails, null, 2)}
        
        STUDENT PROFILE:
        Name: ${studentProfile.fullName}
        Email: ${studentProfile.email}
        
        COMPANY INFO:
        ${JSON.stringify(companyInfo, null, 2)}
        
        Please provide a JSON response with the following structure:
        {
          "subject": "<professional email subject>",
          "body": "<formal offer email content>",
          "attachmentSuggestions": [<array of suggested attachments>],
          "followUpPoints": [<array of follow-up points to mention>]
        }
        
        Make the email warm, professional, and congratulatory while including all necessary details.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional HR communication specialist. Create formal, welcoming offer emails in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in generateOfferEmail:", error);
      throw new Error("Failed to generate offer email");
    }
  }

  /**
   * Generate placement analytics insights
   */
  async generatePlacementInsights(placementData, universityStats) {
    try {
      const prompt = `
        Analyze the following placement data and generate actionable insights for university administrators.
        
        PLACEMENT DATA:
        ${JSON.stringify(placementData, null, 2)}
        
        UNIVERSITY STATS:
        ${JSON.stringify(universityStats, null, 2)}
        
        Please provide a JSON response with the following structure:
        {
          "keyInsights": [<array of most important insights>],
          "trends": [<array of identified trends>],
          "recommendations": [<array of actionable recommendations>],
          "predictions": [<array of predictions for next placement cycle>],
          "alertsAndConcerns": [<array of areas needing attention>],
          "successFactors": [<array of factors contributing to success>],
          "benchmarkComparison": "<comparison with industry standards>"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a placement analytics expert specializing in university career services. Provide data-driven insights in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in generatePlacementInsights:", error);
      throw new Error("Failed to generate placement insights");
    }
  }

  /**
   * Extract and structure text from resume
   */
  async extractResumeData(resumeText) {
    try {
      const prompt = `
        Extract and structure the following resume information into a standardized format:
        
        RESUME TEXT:
        ${resumeText}
        
        Please provide a JSON response with the following structure:
        {
          "personalInfo": {
            "name": "<full name>",
            "email": "<email>",
            "phone": "<phone>",
            "location": "<location>"
          },
          "education": [
            {
              "degree": "<degree>",
              "institution": "<institution>",
              "year": "<year>",
              "grade": "<grade/percentage/cgpa>"
            }
          ],
          "experience": [
            {
              "company": "<company>",
              "position": "<position>",
              "duration": "<duration>",
              "description": "<description>"
            }
          ],
          "skills": [<array of skills>],
          "projects": [
            {
              "title": "<title>",
              "description": "<description>",
              "technologies": [<array of technologies>]
            }
          ],
          "certifications": [<array of certifications>],
          "achievements": [<array of achievements>]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume parser. Extract accurate information and structure it in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error("Error in extractResumeData:", error);
      throw new Error("Failed to extract resume data");
    }
  }
}

export default new OpenAIService();

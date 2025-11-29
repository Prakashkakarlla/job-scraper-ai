import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured job data from scraped content using Google Gemini AI
 * @param {Object} scrapedData - Data from scraper.js
 * @param {string} imageUrl - Optional company logo/image URL to include
 * @param {string} companyName - Optional company name to assist extraction
 * @returns {Promise<Object>} Structured job posting data
 */
export async function extractJobData(scrapedData, imageUrl = '', companyName = '') {
  try {
    console.log('🤖 Starting AI extraction...');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = createExtractionPrompt(scrapedData.textContent, scrapedData.url, companyName);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const jobData = JSON.parse(jsonText);

    // Ensure applyUrl is set
    if (!jobData.applyUrl) {
      jobData.applyUrl = scrapedData.url;
    }

    // Add imageUrl if provided
    if (imageUrl) {
      if (!jobData.companyInfo) jobData.companyInfo = {};
      jobData.companyInfo.imageUrl = imageUrl;
    }

    // Ensure company name is set if provided
    if (companyName && jobData.companyInfo) {
      if (!jobData.companyInfo.name || jobData.companyInfo.name === "Company name") {
        jobData.companyInfo.name = companyName;
      }
    }

    console.log(`✅ Successfully extracted job data: ${jobData.title}`);

    return {
      success: true,
      data: jobData
    };

  } catch (error) {
    console.error(`❌ AI extraction error: ${error.message}`);

    return {
      success: false,
      error: error.message,
      fallbackData: createFallbackJobData(scrapedData, companyName, imageUrl)
    };
  }
}

/**
 * Creates a detailed prompt for the AI to extract job information
 */
function createExtractionPrompt(textContent, url, companyName) {
  const companyContext = companyName ? `The company name is "${companyName}". Use this to infer company details if not explicitly stated.` : '';

  return `You are a job posting data extraction expert. Extract all relevant information from the following job posting and return it as a JSON object.

IMPORTANT: Return ONLY valid JSON, no explanations or markdown formatting outside the JSON.

${companyContext}

Job Posting Content:
${textContent.substring(0, 8000)} // Limit to avoid token limits

Source URL: ${url}

Extract and structure the data in this EXACT format:
{
  "title": "Full job title exactly as posted",
  "subtitle": "A catchy subtitle summarizing the opportunity",
  "postedDate": "YYYY-MM-DD format (use today's date if not found: 2025-11-29)",
  "postedBy": "${companyName || 'Company'} Careers",
  "location": "City name or 'Remote' or 'Pan India'",
  "jobType": "Full-time/Part-time/Contract/Internship",
  "applyUrl": "${url}",
  "fullDescription": "Comprehensive 2-3 sentence description of the role and opportunity",
  "jobDetails": {
    "role": "Specific role title",
    "category": "Off Campus/On Campus/IT Services/Finance/etc",
    "qualification": "Required education (e.g., Graduation / Post Graduation)",
    "batch": "Target graduation year like '2024/2025' or 'N/A'",
    "experience": "Experience level (e.g., 'Freshers', '2-5 years')",
    "salary": "Salary range like '4 - 9 LPA' or 'Not disclosed'",
    "lastDate": "Application deadline or 'ASAP' or 'Not specified'"
  },
  "eligibilityCriteria": [
    "Criterion 1",
    "Criterion 2"
  ],
  "responsibilities": [
    { "task": "Responsibility 1" },
    { "task": "Responsibility 2" }
  ],
  "interviewTips": [
    { "tip": "Helpful tip 1" },
    { "tip": "Helpful tip 2" }
  ],
  "selectionProcess": [
    { "stage": "Stage 1" },
    { "stage": "Stage 2" }
  ],
  "careerGrowth": {
    "description": "Career progression opportunities at this company",
    "futureRoles": [
      "Next role 1",
      "Next role 2"
    ]
  },
  "companyInfo": {
    "name": "${companyName || 'Company name'}",
    "foundedYear": "Year (e.g. 1998) or 'Not specified'",
    "employeeCount": "Number (e.g. 5000+) or 'Not specified'",
    "about": "2-3 sentence company description",
    "technologies": [
      "Tech 1",
      "Tech 2"
    ]
  },
  "faqs": [
    {
      "question": "Common question 1",
      "answer": "Detailed answer"
    }
  ]
}

GUIDELINES:
1. Extract actual information from the posting where available
2. For missing fields, provide reasonable defaults or industry-standard information based on the job title and company.
3. If the content is empty or blocked, use your knowledge about "${companyName || 'the company'}" and the job title to GENERATE plausible details.
4. Interview tips should be relevant to the specific role/company
5. Selection process should reflect typical hiring for this role
6. Career growth should be realistic based on the role level
7. All arrays should have at least 1 item
8. Dates should be in the specified formats
9. DO NOT include an "id" field
10. Return ONLY the JSON object, nothing else`;
}

/**
 * Creates fallback job data if AI extraction fails
 */
function createFallbackJobData(scrapedData, companyName, imageUrl) {
  return {
    title: scrapedData.title || "Job Opportunity",
    subtitle: `Exciting career opportunity at ${companyName || 'Top Company'}`,
    postedDate: new Date().toISOString().split('T')[0],
    postedBy: companyName ? `${companyName} Careers` : "Company Careers",
    location: "Not specified",
    jobType: "Full-time",
    applyUrl: scrapedData.url,
    fullDescription: "Please visit the job posting for full details.",
    jobDetails: {
      role: "Not specified",
      category: "General",
      qualification: "As per job requirements",
      batch: "N/A",
      experience: "Not specified",
      salary: "Not disclosed",
      lastDate: "Not specified"
    },
    eligibilityCriteria: [
      "Please check the original posting for eligibility criteria"
    ],
    responsibilities: [
      { task: "As described in the job posting" }
    ],
    interviewTips: [
      { tip: `Research ${companyName || 'the company'} thoroughly` },
      { tip: "Prepare for behavioral questions" },
      { tip: "Review the job requirements carefully" }
    ],
    selectionProcess: [
      { stage: "Application Review" },
      { stage: "Interview" },
      { stage: "Offer" }
    ],
    careerGrowth: {
      description: "Career growth opportunities available",
      futureRoles: ["Senior Role", "Leadership Role"]
    },
    companyInfo: {
      name: companyName || "Company",
      foundedYear: "Not specified",
      employeeCount: "Not specified",
      about: `Please visit the ${companyName || 'company'} website for more information`,
      technologies: ["Various"],
      imageUrl: imageUrl || ""
    },
    faqs: [
      {
        question: "Where can I find more details?",
        answer: "Please visit the original job posting URL"
      }
    ]
  };
}

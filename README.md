# 🔍 Job Scraper AI

AI-powered job posting data extraction tool that converts any job listing URL into structured JSON format.

## 🌟 Features

- **Intelligent Extraction**: Uses Google Gemini AI to extract comprehensive job details
- **Web Scraping**: Puppeteer-based scraping handles dynamic content
- **Structured Output**: Returns data in a consistent, detailed JSON format
- **Beautiful UI**: Modern, responsive interface with glassmorphism design
- **Export Options**: Copy to clipboard or download as JSON file

## 📋 Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone or Navigate to Project

```bash
cd C:\Users\Prakash\.gemini\antigravity\scratch\job-scraper
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here

# Start the backend server
npm start
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup (New Terminal)

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

Frontend will open automatically at `http://localhost:5173`

## 🎯 Usage

1. **Open the Application**: Navigate to `http://localhost:5173`
2. **Enter Job URL**: Paste any job posting URL (LinkedIn, Indeed, Naukri, company career pages, etc.)
3. **Extract Data**: Click "Extract Data" button
4. **View Results**: See the structured JSON output
5. **Export**: Copy to clipboard or download as JSON file

## 📊 Output Format

The scraper extracts and structures data into this format:

```json
[
    {
        "id": 1,
        "title": "Job Title",
        "subtitle": "Brief description",
        "postedDate": "YYYY-MM-DD",
        "postedBy": "Company Name",
        "location": "City, State",
        "jobType": "Full-time",
        "applyUrl": "https://...",
        "fullDescription": "Detailed description...",
        "jobDetails": {
            "role": "Specific role",
            "category": "Industry",
            "qualification": "Required education",
            "batch": "Graduation year",
            "experience": "Experience level",
            "salary": "Salary range",
            "lastDate": "Application deadline"
        },
        "eligibilityCriteria": ["..."],
        "responsibilities": [{"task": "..."}],
        "interviewTips": [{"tip": "..."}],
        "selectionProcess": [{"stage": "..."}],
        "careerGrowth": {
            "description": "...",
            "futureRoles": ["..."]
        },
        "companyInfo": {
            "name": "Company",
            "foundedYear": "Year",
            "employeeCount": 10000,
            "about": "Description",
            "imageUrl": "Logo URL",
            "technologies": ["..."]
        },
        "faqs": [
            {
                "id": 1,
                "question": "...",
                "answer": "..."
            }
        ]
    }
]
```

## 🔧 Configuration

### Backend (.env)

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

### Supported Job Sites

The scraper works with most job posting websites including:
- LinkedIn Jobs
- Indeed
- Naukri.com
- Company career pages
- Glassdoor
- AngelList
- And many more!

## 📁 Project Structure

```
job-scraper/
├── backend/
│   ├── server.js          # Express server
│   ├── scraper.js         # Puppeteer web scraper
│   ├── aiExtractor.js     # Gemini AI extraction
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main component
    │   ├── App.css
    │   ├── components/
    │   │   ├── JsonViewer.jsx    # JSON display
    │   │   └── JsonViewer.css
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🛠️ API Endpoints

### Backend API

**POST** `/api/scrape`
```json
{
  "url": "https://example.com/job-posting"
}
```

**Response:**
```json
{
  "success": true,
  "data": [{ /* job data */ }]
}
```

**GET** `/health` - Health check endpoint

**GET** `/api/test` - Test endpoint with API documentation

## 🐛 Troubleshooting

### "GEMINI_API_KEY not configured" Error
- Make sure you've created `.env` file in the backend directory
- Add your actual API key (not the placeholder)
- Restart the backend server

### Scraping Fails
- Some sites have anti-bot protection
- Try waiting a few seconds and retry
- The scraper will return fallback data if AI extraction fails

### Puppeteer Installation Issues (Windows)
```bash
# If Puppeteer fails to install, try:
npm install puppeteer --no-optional
```

## 💡 Tips

- The AI extraction works best with standard job posting formats
- For better results, use direct job posting URLs (not search pages)
- The scraper automatically handles dynamic content loading
- Results are returned as an array to match your desired format

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with** ❤️ using React, Express, Puppeteer, and Google Gemini AI

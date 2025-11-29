import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeJobUrl, validateJobUrl } from './scraper.js';
import { extractJobData } from './aiExtractor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Job Scraper API is running',
        timestamp: new Date().toISOString()
    });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
    try {
        const { url, imageUrl, companyName } = req.body;

        // Validate input
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📥 New scraping request: ${url}`);
        if (companyName) console.log(`🏢 Company: ${companyName}`);
        if (imageUrl) console.log(`🖼️  Image: ${imageUrl}`);
        console.log(`${'='.repeat(60)}\n`);

        // Validate URL format
        const validation = await validateJobUrl(url);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        if (!validation.likelyJobPosting) {
            console.log('⚠️  Warning: URL may not be a job posting');
        }

        // Step 1: Scrape the URL
        const scrapedData = await scrapeJobUrl(url);

        if (!scrapedData.success) {
            return res.status(500).json({
                success: false,
                error: `Scraping failed: ${scrapedData.error}`
            });
        }

        // Step 2: Extract structured data using AI
        const extractionResult = await extractJobData(scrapedData, imageUrl || '', companyName || '');

        if (!extractionResult.success) {
            // Return fallback data if AI extraction fails
            console.log('⚠️  AI extraction failed, returning fallback data');
            return res.json({
                success: true,
                warning: 'Used fallback data due to extraction error',
                data: extractionResult.fallbackData
            });
        }

        // Success! Return the extracted job data
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Successfully processed job posting`);
        console.log(`${'='.repeat(60)}\n`);

        res.json({
            success: true,
            data: extractionResult.data // Return as single object
        });

    } catch (error) {
        console.error(`❌ Server error: ${error.message}`);
        console.error(error.stack);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Test endpoint for quick verification
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        endpoints: {
            health: 'GET /health',
            scrape: 'POST /api/scrape (body: { url: "job-posting-url", imageUrl: "optional-image-url", companyName: "optional-company-name" })',
            test: 'GET /api/test'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Job Scraper API Server`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`${'='.repeat(60)}\n`);

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
        console.log(`⚠️  WARNING: GEMINI_API_KEY not configured!`);
        console.log(`Please set your API key in the .env file`);
        console.log(`Get your key from: https://makersuite.google.com/app/apikey\n`);
    } else {
        console.log(`✅ Gemini API key configured\n`);
    }
});

export default app;

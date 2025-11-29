import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { scrapeJobUrl, validateJobUrl } from '../scraper.js';
import { extractJobData } from '../aiExtractor.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
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

        const scrapedData = await scrapeJobUrl(url);

        if (!scrapedData.success) {
            return res.status(500).json({
                success: false,
                error: `Scraping failed: ${scrapedData.error}`
            });
        }

        const extractionResult = await extractJobData(scrapedData, imageUrl || '', companyName || '');

        if (!extractionResult.success) {
            console.log('⚠️  AI extraction failed, returning fallback data');
            return res.json({
                success: true,
                warning: 'Used fallback data due to extraction error',
                data: extractionResult.fallbackData
            });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Successfully processed job posting`);
        console.log(`${'='.repeat(60)}\n`);

        res.json({
            success: true,
            data: extractionResult.data
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

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        endpoints: {
            health: 'GET /api/health',
            scrape: 'POST /api/scrape',
            test: 'GET /api/test'
        }
    });
});

export default app;

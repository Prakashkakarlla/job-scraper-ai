import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import * as cheerio from 'cheerio';

/**
 * Scrapes a job posting URL and extracts raw HTML and text content
 * @param {string} url - The job posting URL to scrape
 * @returns {Promise<Object>} Object containing html, text, title, and metadata
 */
export async function scrapeJobUrl(url) {
    let browser = null;

    try {
        console.log(`🔍 Scraping URL: ${url}`);

        // Determine if running in production (Vercel) or local
        const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

        console.log(`Environment: ${isProduction ? 'Production (Vercel)' : 'Local'}`);

        // Launch browser with optimized settings and timeout
        const launchTimeout = setTimeout(() => {
            throw new Error('Browser launch timeout - Puppeteer took too long to start');
        }, 10000); // 10 second timeout for browser launch

        browser = await puppeteer.launch({
            args: isProduction ? [
                ...chromium.args,
                '--single-process',
                '--no-zygote'
            ] : [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: isProduction
                ? await chromium.executablePath()
                : process.env.CHROME_PATH || undefined,
            headless: chromium.headless || 'new',
            timeout: 10000
        });

        clearTimeout(launchTimeout);
        console.log('✅ Browser launched successfully');

        const page = await browser.newPage();

        // Set realistic user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Navigate to the URL with reduced timeout for Vercel
        console.log('📄 Navigating to page...');
        await page.goto(url, {
            waitUntil: 'domcontentloaded', // Faster than networkidle2
            timeout: 15000 // Reduced from 30s to 15s
        });
        console.log('✅ Page loaded');

        // Wait for dynamic content (reduced for Vercel)
        await new Promise(r => setTimeout(r, 1000)); // Reduced from 2s to 1s

        // Get the page content
        const html = await page.content();
        const pageTitle = await page.title();

        // Extract visible text content
        const textContent = await page.evaluate(() => {
            // Remove script and style elements
            const scripts = document.querySelectorAll('script, style, noscript');
            scripts.forEach(el => el.remove());

            return document.body.innerText;
        });

        // Parse HTML with Cheerio for additional extraction
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, noscript, iframe').remove();

        // Try to find common job posting containers
        const jobContainers = [
            '[class*="job-detail"]',
            '[class*="job-description"]',
            '[id*="job-detail"]',
            '[id*="job-description"]',
            'main',
            'article',
            '[role="main"]'
        ];

        let relevantHtml = '';
        for (const selector of jobContainers) {
            const element = $(selector).first();
            if (element.length && element.text().length > 100) {
                relevantHtml = element.html();
                break;
            }
        }

        // If no specific container found, use body
        if (!relevantHtml) {
            relevantHtml = $('body').html();
        }

        console.log(`✅ Successfully scraped: ${pageTitle}`);

        return {
            success: true,
            url,
            title: pageTitle,
            html: relevantHtml,
            fullHtml: html,
            textContent: textContent.trim(),
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ Scraping error: ${error.message}`);

        return {
            success: false,
            error: error.message,
            url
        };

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Validates if a URL is accessible and appears to be a job posting
 * @param {string} url - URL to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateJobUrl(url) {
    try {
        new URL(url); // Check if valid URL format

        // Check if URL contains job-related keywords
        const jobKeywords = ['job', 'career', 'position', 'hiring', 'vacancy', 'apply', 'recruit'];
        const urlLower = url.toLowerCase();
        const hasJobKeyword = jobKeywords.some(keyword => urlLower.includes(keyword));

        return {
            valid: true,
            likelyJobPosting: hasJobKeyword,
            url
        };
    } catch (error) {
        return {
            valid: false,
            error: 'Invalid URL format',
            url
        };
    }
}

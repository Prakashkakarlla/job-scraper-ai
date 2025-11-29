import { useState } from 'react';
import JobEditor from './components/JobEditor';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://job-scraper-ai-8xgy.vercel.app/api/scrape';

function App() {
    const [url, setUrl] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url.trim(),
                    companyName: companyName.trim(),
                    imageUrl: imageUrl.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to scrape job posting');
            }

            // Handle both array and single object responses
            const resultData = Array.isArray(data.data) ? data.data[0] : data.data;
            setResult(resultData);

            if (data.warning) {
                console.warn(data.warning);
            }

        } catch (err) {
            setError(err.message || 'An error occurred while scraping');
            console.error('Scraping error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setUrl('');
        setCompanyName('');
        setImageUrl('');
        setResult(null);
        setError(null);
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <div className="logo-icon">🔍</div>
                        <h1>Job Scraper AI</h1>
                    </div>
                    <p className="tagline">AI-Powered Job Posting Data Extraction</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    {/* Input Section */}
                    <section className="input-section">
                        <div className="card glass-card">
                            <h2>Extract Job Details</h2>
                            <p className="description">
                                Paste any job posting URL and get structured data instantly
                            </p>

                            <form onSubmit={handleSubmit} className="scraper-form">
                                <div className="input-group">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com/jobs/software-engineer"
                                        className="url-input"
                                        disabled={loading}
                                        required
                                    />

                                    <div className="row-inputs">
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Company Name (Optional)"
                                            className="url-input half-width"
                                            disabled={loading}
                                        />
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="Company Logo URL (Optional)"
                                            className="url-input half-width"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="button-group">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading || !url.trim()}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    Extracting...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">🚀</span>
                                                    Extract Data
                                                </>
                                            )}
                                        </button>
                                        {(result || error || url || imageUrl || companyName) && (
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="btn btn-secondary"
                                                disabled={loading}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {loading && (
                                <div className="loading-indicator">
                                    <div className="progress-bar">
                                        <div className="progress-fill"></div>
                                    </div>
                                    <p>Analyzing job posting with AI...</p>
                                </div>
                            )}

                            {error && (
                                <div className="error-message">
                                    <span className="error-icon">⚠️</span>
                                    <div>
                                        <strong>Error:</strong> {error}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Results Section */}
                    {result && (
                        <section className="results-section">
                            <div className="card glass-card">
                                <JobEditor initialData={result} />
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>Powered by Google Gemini AI & Puppeteer</p>
            </footer>
        </div>
    );
}

export default App;

import { useState, useEffect } from 'react';
import './JobEditor.css';

const JobEditor = ({ initialData }) => {
    const [formData, setFormData] = useState(initialData);
    const [showJson, setShowJson] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (section, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[section]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [section]: newArray };
        });
    };

    const handleSimpleArrayChange = (section, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[section]];
            newArray[index] = value;
            return { ...prev, [section]: newArray };
        });
    };

    const addItem = (section, template) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), template]
        }));
    };

    const removeItem = (section, index) => {
        setFormData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(formData, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-data-${formData.companyInfo?.name || 'extracted'}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (showJson) {
        return (
            <div className="job-editor">
                <div className="editor-header">
                    <h3>JSON Preview</h3>
                    <div className="header-actions">
                        <button onClick={() => setShowJson(false)} className="btn btn-secondary">
                            ✏️ Back to Edit
                        </button>
                        <button onClick={handleCopy} className="btn btn-primary">
                            {copied ? '✅ Copied!' : '📋 Copy JSON'}
                        </button>
                        <button onClick={handleDownload} className="btn btn-secondary">
                            💾 Download
                        </button>
                    </div>
                </div>
                <pre className="json-preview">
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div className="job-editor">
            <div className="editor-header">
                <h3>Edit Job Details</h3>
                <div className="header-actions">
                    <button onClick={() => setShowJson(true)} className="btn btn-secondary">
                        👁️ View JSON
                    </button>
                    <button onClick={handleCopy} className="btn btn-primary">
                        {copied ? '✅ Copied!' : '📋 Copy JSON'}
                    </button>
                    <button onClick={handleDownload} className="btn btn-secondary">
                        💾 Download
                    </button>
                </div>
            </div>

            <div className="editor-form">
                {/* Basic Info */}
                <section className="form-section">
                    <h4>Basic Information</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Job Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subtitle</label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Posted Date</label>
                            <input
                                type="date"
                                value={formData.postedDate || ''}
                                onChange={(e) => handleChange('postedDate', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Posted By</label>
                            <input
                                type="text"
                                value={formData.postedBy || ''}
                                onChange={(e) => handleChange('postedBy', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={formData.location || ''}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Job Type</label>
                            <input
                                type="text"
                                value={formData.jobType || ''}
                                onChange={(e) => handleChange('jobType', e.target.value)}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Apply URL</label>
                            <input
                                type="url"
                                value={formData.applyUrl || ''}
                                onChange={(e) => handleChange('applyUrl', e.target.value)}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Full Description</label>
                            <textarea
                                value={formData.fullDescription || ''}
                                onChange={(e) => handleChange('fullDescription', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </section>

                {/* Job Details */}
                <section className="form-section">
                    <h4>Job Details</h4>
                    <div className="form-grid">
                        {Object.entries(formData.jobDetails || {}).map(([key, value]) => (
                            <div className="form-group" key={key}>
                                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="text"
                                    value={value || ''}
                                    onChange={(e) => handleNestedChange('jobDetails', key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Company Info */}
                <section className="form-section">
                    <h4>Company Information</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.companyInfo?.name || ''}
                                onChange={(e) => handleNestedChange('companyInfo', 'name', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Founded Year</label>
                            <input
                                type="text"
                                value={formData.companyInfo?.foundedYear || ''}
                                onChange={(e) => handleNestedChange('companyInfo', 'foundedYear', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Employee Count</label>
                            <input
                                type="text"
                                value={formData.companyInfo?.employeeCount || ''}
                                onChange={(e) => handleNestedChange('companyInfo', 'employeeCount', e.target.value)}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>About</label>
                            <textarea
                                value={formData.companyInfo?.about || ''}
                                onChange={(e) => handleNestedChange('companyInfo', 'about', e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Image URL</label>
                            <input
                                type="url"
                                value={formData.companyInfo?.imageUrl || ''}
                                onChange={(e) => handleNestedChange('companyInfo', 'imageUrl', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Eligibility Criteria (Simple Array) */}
                <section className="form-section">
                    <div className="section-header">
                        <h4>Eligibility Criteria</h4>
                        <button onClick={() => addItem('eligibilityCriteria', '')} className="btn-add">+</button>
                    </div>
                    {formData.eligibilityCriteria?.map((item, index) => (
                        <div className="array-item" key={index}>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleSimpleArrayChange('eligibilityCriteria', index, e.target.value)}
                            />
                            <button onClick={() => removeItem('eligibilityCriteria', index)} className="btn-remove">×</button>
                        </div>
                    ))}
                </section>

                {/* Responsibilities (Object Array) */}
                <section className="form-section">
                    <div className="section-header">
                        <h4>Responsibilities</h4>
                        <button onClick={() => addItem('responsibilities', { task: '' })} className="btn-add">+</button>
                    </div>
                    {formData.responsibilities?.map((item, index) => (
                        <div className="array-item" key={index}>
                            <input
                                type="text"
                                value={item.task}
                                onChange={(e) => handleArrayChange('responsibilities', index, 'task', e.target.value)}
                                placeholder="Task description"
                            />
                            <button onClick={() => removeItem('responsibilities', index)} className="btn-remove">×</button>
                        </div>
                    ))}
                </section>

                {/* Interview Tips (Object Array) */}
                <section className="form-section">
                    <div className="section-header">
                        <h4>Interview Tips</h4>
                        <button onClick={() => addItem('interviewTips', { tip: '' })} className="btn-add">+</button>
                    </div>
                    {formData.interviewTips?.map((item, index) => (
                        <div className="array-item" key={index}>
                            <input
                                type="text"
                                value={item.tip}
                                onChange={(e) => handleArrayChange('interviewTips', index, 'tip', e.target.value)}
                                placeholder="Tip"
                            />
                            <button onClick={() => removeItem('interviewTips', index)} className="btn-remove">×</button>
                        </div>
                    ))}
                </section>

                {/* Selection Process (Object Array) */}
                <section className="form-section">
                    <div className="section-header">
                        <h4>Selection Process</h4>
                        <button onClick={() => addItem('selectionProcess', { stage: '' })} className="btn-add">+</button>
                    </div>
                    {formData.selectionProcess?.map((item, index) => (
                        <div className="array-item" key={index}>
                            <input
                                type="text"
                                value={item.stage}
                                onChange={(e) => handleArrayChange('selectionProcess', index, 'stage', e.target.value)}
                                placeholder="Stage name"
                            />
                            <button onClick={() => removeItem('selectionProcess', index)} className="btn-remove">×</button>
                        </div>
                    ))}
                </section>

                {/* FAQs (Object Array) */}
                <section className="form-section">
                    <div className="section-header">
                        <h4>FAQs</h4>
                        <button onClick={() => addItem('faqs', { question: '', answer: '' })} className="btn-add">+</button>
                    </div>
                    {formData.faqs?.map((item, index) => (
                        <div className="array-item-group" key={index}>
                            <div className="group-inputs">
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => handleArrayChange('faqs', index, 'question', e.target.value)}
                                    placeholder="Question"
                                />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => handleArrayChange('faqs', index, 'answer', e.target.value)}
                                    placeholder="Answer"
                                    rows={2}
                                />
                            </div>
                            <button onClick={() => removeItem('faqs', index)} className="btn-remove group-remove">×</button>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default JobEditor;

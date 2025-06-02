import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Styles/SendMail.css';

function SendMail() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        setPreviewUrl('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/subscribers/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subject, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send mail');
            setSuccess(data.message);
            if (data.previewUrl) setPreviewUrl(data.previewUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="send-mail-page">
            <h2>Send Email to All Subscribers</h2>
            <form className="send-mail-form" onSubmit={handleSubmit}>
                <label>Subject</label>
                <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="send-mail-input"
                />
                <label>Message</label>
                <ReactQuill
                    value={message}
                    onChange={setMessage}
                    className="send-mail-editor"
                    theme="snow"
                />
                <div className="send-mail-actions">
                    <button
                        type="button"
                        className="preview-btn"
                        onClick={() => setPreview(!preview)}
                        disabled={!message}
                    >
                        {preview ? 'Hide Preview' : 'Preview'}
                    </button>
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={loading || !subject || !message}
                    >
                        {loading ? 'Sending...' : 'Send to All Subscribers'}
                    </button>
                </div>
                {success && <div className="send-mail-success">{success} {previewUrl && (<a href={previewUrl} target="_blank" rel="noopener noreferrer">Preview Email</a>)}</div>}
                {error && <div className="send-mail-error">{error}</div>}
            </form>
            {preview && (
                <div className="send-mail-preview">
                    <h3>Email Preview</h3>
                    <div className="send-mail-preview-content" dangerouslySetInnerHTML={{ __html: message }} />
                </div>
            )}
        </div>
    );
}

export default SendMail; 
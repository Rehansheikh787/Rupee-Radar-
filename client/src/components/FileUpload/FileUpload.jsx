import React, { useState, useRef } from 'react';
import './FileUpload.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function FileUpload({ onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | analyzing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    // 1. Validation
    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a CSV (.csv) statement.');
      setStatus('error');
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxSizeBytes) {
      setErrorMsg('File exceeds 5MB size limit.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');
    setProgress(10);

    try {
      // 2. Upload file
      const formData = new FormData();
      formData.append('statement', file);

      setProgress(30);
      const uploadResponse = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errJson = await uploadResponse.json();
        throw new Error(errJson.error || 'Failed to upload file.');
      }

      setProgress(60);
      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.data.fileId;

      // 3. Analyze file
      setStatus('analyzing');
      setProgress(80);

      const analyzeResponse = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileId })
      });

      if (!analyzeResponse.ok) {
        const errJson = await analyzeResponse.json();
        throw new Error(errJson.error || 'Failed to analyze statement.');
      }

      setProgress(100);
      const analyzeResult = await analyzeResponse.json();
      
      // Complete callback
      setTimeout(() => {
        onAnalysisComplete(analyzeResult.data);
      }, 500);

    } catch (err) {
      console.error('❌ Upload pipeline error:', err);
      setErrorMsg(err.message || 'An error occurred during statement processing.');
      setStatus('error');
    }
  };

  return (
    <div className="file-upload-container">
      <form 
        className={`upload-form ${dragActive ? 'drag-active' : ''} ${status}`}
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="file-input-hidden" 
          accept=".csv"
          onChange={handleChange}
        />

        {status === 'idle' && (
          <div className="upload-view" onClick={onButtonClick}>
            <div className="upload-icon-wrapper">📥</div>
            <p className="upload-prompt">
              Drag & drop your bank statement CSV file here
            </p>
            <span className="upload-or">or</span>
            <button type="button" className="btn-browse">Browse Files</button>
            <span className="upload-limits">Supported formats: CSV (Max 5MB)</span>
          </div>
        )}

        {(status === 'uploading' || status === 'analyzing') && (
          <div className="progress-view">
            <div className="spinner-loader"></div>
            <p className="status-label">
              {status === 'uploading' ? 'Uploading statement...' : 'AI Analysing transactions...'}
            </p>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-percent">{progress}%</span>
          </div>
        )}

        {status === 'error' && (
          <div className="error-view">
            <div className="error-icon-wrapper">⚠️</div>
            <h4>Processing Failed</h4>
            <p className="error-message">{errorMsg}</p>
            <button type="button" className="btn-retry" onClick={() => setStatus('idle')}>
              Try Again
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default FileUpload;

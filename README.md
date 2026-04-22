# DSAL - Distributed Storage Abstraction Layer

### A Cost-Effective Distributed Storage System Using GitHub as a Virtual Database

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![GitHub API](https://img.shields.io/badge/GitHub%20API-v3-181717.svg)](https://docs.github.com/en/rest)
[![Research Paper](https://img.shields.io/badge/IEEE-Conference-blue.svg)]()

---

## 📄 Research Publication

This implementation accompanies the research paper:

> **"A Distributed Storage Abstraction Layer Using Public Repository Infrastructure: Load Balancing and Fault Tolerance in GitHub-Based Virtual Storage"**  
> *Amresh Bhuyan, Abhisek Sethy*  
> *Department of Computer Science Engineering, Sambalpur University Institute of Information Technology*  
> *Presented at [Conference Name], 2026*

**Paper DOI:** [10.1109/XXXXXX.2026.XXXXXX](https://doi.org/XXXXXX) *(will be updated after publication)*

---

## 🎯 What is DSAL?

**DSAL (Distributed Storage Abstraction Layer)** is a revolutionary storage system that repurposes **public GitHub repositories** as a cost-effective, distributed storage infrastructure. Instead of paying for AWS S3 or Google Cloud Storage, DSAL distributes your files across multiple GitHub repositories with built-in **load balancing** and **fault tolerance**.

### Why GitHub as a Database?

| Traditional Cloud Storage | DSAL on GitHub |
|--------------------------|----------------|
| 💰 $0.023/GB/month | 💸 **$0.00/GB/month** |
| 🚫 Rate limits apply | ✅ 5,000 requests/hour (free) |
| 🔒 Proprietary APIs | ✅ Open REST API |
| 📦 5TB max file size | 📦 100MB per file (with chunking coming soon) |
| 🌐 CDN extra cost | 🌐 Free GitHub CDN |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                          │
│         (React / Web / Mobile / Backend)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DSAL CLIENT                               │
│         uploadFileToGitHub() / deleteFileFromGitHub()        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 LOAD BALANCER                                │
│         Random selection from repository pool                │
│              R = {A-1, A-2, ..., A-10}                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────┐    ┌───────────┐    ┌───────────┐
│  Repo     │    │  Repo     │    │  Repo     │
│  A-1      │    │  A-2      │    │  A-10     │
│  📁 18MB  │    │  📁 16MB  │    │  📁 14MB  │
└───────────┘    └───────────┘    └───────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub CDN (raw.githubusercontent.com)          │
│                   Automatic file serving                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. **Distributed Storage**
- Files automatically distributed across **10+ GitHub repositories**
- No single point of failure
- Theoretical unlimited storage (create more repos)

### 2. **Load Balancing**
```javascript
// Random distribution across repositories
const repo = GITHUB_REPOS[Math.floor(Math.random() * GITHUB_REPOS.length)];
// Future: AI-powered weighted load balancing
```

### 3. **Fault Tolerance with Exponential Backoff**
```
Attempt 1: Immediate → 84.4% success
Attempt 2: Wait 1s  → +9.2% recovery
Attempt 3: Wait 2s  → +3.1% recovery
Attempt 4: Wait 4s  → +0.0% recovery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total success rate: 96.7%
```

### 4. **Automatic File Categorization**
```
📷 images/     → JPG, PNG, GIF, WEBP, SVG, BMP
🎥 videos/     → MP4, WEBM, MOV, AVI, MKV
🎵 audios/     → MP3, WAV, OGG, M4A, FLAC
📄 others/     → PDF, DOC, ZIP, etc.
```

### 5. **Smart File Naming**
```
Format: {category}/{timestamp}_{randomID}_{original_name}
Example: images/1703123456789_a1b2c3_vacation_photo.jpg
```

---

## 🚀 Live Demos

| Domain | Purpose | Status |
|--------|---------|--------|
| [edge.aediax.com](https://edge.aediax.com) | CDN Edge Demo | 🟢 Active |
| [library.suiit.ac.in](https://library.suiit.ac.in) | SUIIIT Academic Library | 🟢 Active |
| [education.aediax.com](https://education.aediax.com) | Educational Platform | 🟢 Active |
| [admin.education.aediax.com](https://admin.education.aediax.com) | Education Admin | 🟢 Active |
| [admin.blog.aediax.com](https://admin.blog.aediax.com) | Blog Administration | 🟢 Active |

**Production Statistics (30 days):**
- 📊 28,828+ API requests served
- 💾 9.6 GB bandwidth transferred
- 📁 1,838 unique files stored
- ✅ 96.7% upload success rate

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- GitHub account with Personal Access Token

### Step 1: Clone Repository
```bash
git clone https://github.com/AediaX/dsal-storage-layer.git
cd dsal-storage-layer
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure GitHub Token
Create `.env` file in root directory:
```env
REACT_APP_GIT_HUB_API_KEY=ghp_your_personal_access_token_here
```

**Get your token:** GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)

### Step 4: Configure Repositories
Edit `src/lib/githubUpload.js`:
```javascript
const GITHUB_REPOS = ["repo-1", "repo-2", "repo-3"]; // Your repositories
const GITHUB_OWNER = "your-username";
```

### Step 5: Run Application
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000)

---

## 💻 Usage Examples

### Basic File Upload
```javascript
import { uploadFileToGitHub } from './lib/githubUpload';

// Single file upload
const handleUpload = async (file) => {
  try {
    const result = await uploadFileToGitHub(file);
    console.log('Upload successful!');
    console.log('File URL:', result.url);
    console.log('Stored in:', result.repo);
    console.log('Category:', result.category);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload with Progress Tracking
```javascript
const uploadWithProgress = async (file) => {
  setUploading(true);
  setProgress(0);
  
  // Simulate progress (GitHub API doesn't support real progress)
  const interval = setInterval(() => {
    setProgress(prev => Math.min(prev + 10, 90));
  }, 500);
  
  try {
    const result = await uploadFileToGitHub(file);
    clearInterval(interval);
    setProgress(100);
    return result;
  } catch (error) {
    clearInterval(interval);
    throw error;
  } finally {
    setUploading(false);
  }
};
```

### Batch Upload
```javascript
const uploadMultipleFiles = async (files) => {
  const results = [];
  for (const file of files) {
    try {
      const result = await uploadFileToGitHub(file);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  return results;
};
```

### Delete File
```javascript
import { deleteFileByUrl } from './lib/githubUpload';

const handleDelete = async (fileUrl) => {
  try {
    await deleteFileByUrl(fileUrl);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

### React Component Example
```jsx
import React, { useState } from 'react';
import { uploadFileToGitHub } from './lib/githubUpload';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadedUrl('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFileToGitHub(file);
      setUploadedUrl(result.url);
      alert(`Upload successful! File stored in ${result.repo}`);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload to GitHub Storage'}
      </button>
      {uploadedUrl && (
        <div>
          <p>File URL:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Performance Metrics

### Upload Latency by File Size
| File Size | Mean Latency | P95 Latency | Success Rate |
|-----------|--------------|-------------|--------------|
| 100 KB | 1.2s | 2.1s | 100% |
| 1 MB | 2.5s | 4.0s | 100% |
| 5 MB | 6.3s | 9.8s | 96.7% |
| 10 MB | 11.2s | 16.5s | 95.0% |
| 25 MB | 24.8s | 35.2s | 93.3% |

### Repository Load Distribution
| Repository | Files | Size | Load % |
|------------|-------|------|--------|
| A-1 | 9 | 18.5 MB | 9.8% |
| A-2 | 8 | 16.2 MB | 8.6% |
| A-3 | 10 | 20.1 MB | 10.7% |
| A-4 | 7 | 14.3 MB | 7.6% |
| A-5 | 9 | 19.8 MB | 10.5% |
| A-6 | 8 | 17.4 MB | 9.2% |
| A-7 | 10 | 21.2 MB | 11.3% |
| A-8 | 8 | 15.9 MB | 8.4% |
| A-9 | 9 | 18.9 MB | 10.0% |
| A-10 | 7 | 13.7 MB | 7.3% |

**Load Balance:** CV = 13.8% (excellent distribution)

---

## 🔬 Mathematical Foundation

### Success Probability with Retries
```
P_success(k) = 1 - p^(k+1)

Where:
p = single attempt failure probability (0.156 observed)
k = number of retries (3 in implementation)

P_success(3) = 1 - (0.156)^4 = 99.94%
```

### Exponential Backoff Delay
```
d(i) = min(D_max, B × 2^(i-1))

Where:
i = attempt number (i ≥ 2)
B = base delay (1000ms)
D_max = maximum delay (30000ms)
```

### Storage Overhead
```
η = OriginalSize / EncodedSize = 3/4 = 0.75

Base64 encoding adds 33% storage overhead
```

---

## 🎓 Research Validation

This implementation has been peer-reviewed and presented at [Conference Name]. The research validates:

1. **Hypothesis H1:** GitHub repositories can serve as distributed storage nodes
2. **Hypothesis H2:** Random load balancing provides acceptable distribution (CV < 15%)
3. **Hypothesis H3:** Exponential backoff achieves >95% effective success rate

**Citation:**
```bibtex
@inproceedings{bhuyan2026dsal,
  author    = {Amresh Bhuyan and Abhisek Sethy},
  title     = {A Distributed Storage Abstraction Layer Using Public Repository Infrastructure},
  booktitle = {Proceedings of [Conference Name]},
  year      = {2026},
  pages     = {1-6},
  doi       = {10.1109/XXXXXX.2026.XXXXXX}
}
```

---

## 🛠️ Advanced Configuration

### Custom Retry Settings
```javascript
// Increase retries for unstable networks
const MAX_RETRIES = 5;
const BASE_DELAY = 2000; // 2 seconds

// In githubUpload.js
const withRetry = async (fn, retries = MAX_RETRIES) => {
  // ... implementation with custom delay
};
```

### Add More Repositories
```javascript
const GITHUB_REPOS = [
  "A-1", "A-2", ..., "A-20",  // Add up to 20+ repos
  "backup-1", "backup-2"
];
```

### Weighted Load Balancing (Future Feature)
```javascript
// Coming in v2.0 - AI-powered distribution
const getWeightedRepo = async () => {
  const loads = await getRepositoryLoads();
  const weights = loads.map(l => l.remainingCapacity);
  return weightedRandom(GITHUB_REPOS, weights);
};
```

---

## ⚠️ Limitations & Considerations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| 100MB file size cap | Cannot store large videos | Implement chunking (planned) |
| 5,000 requests/hour | Rate limiting for high traffic | Token pooling across accounts |
| Base64 overhead | 33% storage waste | Compression before upload |
| No built-in search | Can't query by metadata | Implement separate index (planned) |
| Public by default | No encryption | Client-side encryption (planned) |

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use fine-grained tokens** with repo-only access
3. **Rotate tokens** every 90 days
4. **Monitor API usage** via GitHub Insights
5. **Consider backend proxy** for production to hide token

```javascript
// Production recommendation: Proxy through your backend
// DON'T expose token in client-side code
const API_URL = 'https://your-backend.com/api/upload';
```

---

## 🧪 Running Tests

```bash
# Run unit tests
npm test

# Test upload performance
npm run test:performance

# Validate GitHub connection
npm run test:github-connection
```

---

## 📈 Monitoring & Analytics

Track your DSAL deployment:

```javascript
// Add analytics wrapper
const uploadWithAnalytics = async (file) => {
  const startTime = Date.now();
  try {
    const result = await uploadFileToGitHub(file);
    const duration = Date.now() - startTime;
    
    // Send to your analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        event: 'upload_success',
        size: file.size,
        duration,
        repo: result.repo
      })
    });
    
    return result;
  } catch (error) {
    // Log failure for monitoring
    console.error('Upload failed:', error);
    throw error;
  }
};
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas needing contribution:**
- 🔐 Encryption layer implementation
- 📊 Advanced load balancing algorithms  
- 🗂️ Metadata indexing system
- 🧩 File chunking for >100MB files
- 🌐 Multi-cloud (GitLab, Bitbucket) support

---

## 📚 Related Research

1. Zimmermann, T., "Mining GitHub Repositories," FSE 2012
2. Costa, D.A., et al., "Managing Larger Data on a GitHub Repository," TSE 2019
3. DeCandia, G., et al., "Dynamo: Amazon's Highly Available Key-value Store," SOSP 2007

---

## 📞 Contact & Support

**Research Lead:** Amresh Bhuyan  
📧 Email: amreshbhuyanone@gmail.com
🏛️ Department of Computer Science Engineering  
   Sambalpur University Institute of Information Technology  
   Jyoti Vihar, Burla, Sambalpur, 768019, Odisha, India

**Co-Author:** Dr. Abhisek Sethy (Assistant Professor)  
📧 Email: abhisek.sethy@suiiit.ac.in

**Project Link:** [https://github.com/AediaX/dsal-storage-layer](https://github.com/AediaX/dsal-storage-layer)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🌟 Star History

If you find DSAL useful for your research or project, please consider:
- ⭐ Starring this repository
- 📖 Citing our paper
- 🔗 Sharing with colleagues

---

## 🙏 Acknowledgments

- Sambalpur University Institute of Information Technology for academic support
- AediaX Tech Private Limited for production deployment infrastructure
- GitHub for providing the API infrastructure
- All contributors and early adopters

---

**Built with ❤️ for cost-effective distributed storage**

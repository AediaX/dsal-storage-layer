// lib/githubUploadCertificate.jsx
import axios from 'axios';

const GITHUB_REPOS = ["C-1", "C-2", "C-3", "C-4", "C-5", "C-6", "C-7", "C-8", "C-9", "C-10"];
const GITHUB_OWNER = "webaediax-ai";
const GITHUB_TOKEN = process.env.REACT_APP_GIT_HUB_API_KEY;
const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT = 60000;

const getOptimalRepo = async () => {
  return GITHUB_REPOS[Math.floor(Math.random() * GITHUB_REPOS.length)];
};

const withRetry = async (fn, retries = MAX_RETRIES) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

const githubApiRequest = async (method, url, data = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      timeout: UPLOAD_TIMEOUT,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`GitHub API error: ${error.response.data.message || 'Unknown error'}`);
    }
    throw error;
  }
};

const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

const getFileCategory = (extension) => {
  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExt = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
  const audioExt = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  
  if (imageExt.includes(extension)) return 'images';
  if (videoExt.includes(extension)) return 'videos';
  if (audioExt.includes(extension)) return 'audios';
  return 'certificates';
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadCertificateToGitHub = async (file, customFileName = null) => {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured');
  }

  return withRetry(async () => {
    try {
      const originalName = file.name;
      const extension = getFileExtension(originalName);
      const category = getFileCategory(extension);
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = customFileName || `certificates/${category}/${timestamp}_${randomId}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const base64Data = await fileToBase64(file);
      const content = base64Data.split(',')[1];
      const repo = await getOptimalRepo();
      const path = `media_files/${fileName}`;
      
      await githubApiRequest(
        'put',
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
        {
          message: `Upload certificate: ${fileName}`,
          content,
          committer: {
            name: 'Certificate Uploader',
            email: 'noreply@aediax.com'
          }
        }
      );
      
      const fileUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/main/${path}?t=${timestamp}`;
      
      return {
        success: true,
        url: fileUrl,
        fileName: fileName,
        originalName: originalName,
        fileSize: file.size,
        fileType: file.type,
        extension: extension,
        category: category,
        repo: repo,
        path: path,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  });
};

export const deleteFileFromGitHub = async (fileUrl, repo, path) => {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured');
  }

  return withRetry(async () => {
    try {
      const fileInfo = await githubApiRequest(
        'get',
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`
      );

      await githubApiRequest(
        'delete',
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
        {
          message: `Delete file: ${path}`,
          sha: fileInfo.sha,
          committer: {
            name: 'File Deletor',
            email: 'noreply@aediax.com'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      if (error.message.includes('Not Found')) {
        return true;
      }
      throw error;
    }
  });
};

export const deleteFileByUrl = async (fileUrl) => {
  try {
    if (fileUrl.includes('raw.githubusercontent.com') && fileUrl.includes(GITHUB_OWNER)) {
      const urlParts = fileUrl.split('/');
      const repoIndex = urlParts.indexOf('raw.githubusercontent.com') + 1;
      const repo = urlParts[repoIndex + 1];
      const path = urlParts.slice(repoIndex + 3).join('/').split('?')[0];
      
      return await deleteFileFromGitHub(fileUrl, repo, path);
    }
    return true;
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return false;
  }
};
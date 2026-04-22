import axios from 'axios';

// Configuration
const GITHUB_REPOS = ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6", "A-7", "A-8", "A-9", "A-10"];
const GITHUB_OWNER = "webaediax-ai";
const GITHUB_TOKEN = process.env.REACT_APP_GIT_HUB_API_KEY;
const MAX_RETRIES = 3;
const UPLOAD_TIMEOUT = 30000; // 30 seconds

// Cache for repo availability to reduce API calls
const repoAvailabilityCache = new Map();
const repoUsageCount = new Map(); // Track usage count for load balancing

// Initialize usage counters for all repos
GITHUB_REPOS.forEach(repo => {
  repoUsageCount.set(repo, 0);
});

// Helper function with weighted random selection to distribute load
const getOptimalRepo = async () => {
  // Try cached available repos first
  const availableRepos = [];
  
  for (const repo of GITHUB_REPOS) {
    const isAvailable = repoAvailabilityCache.get(repo);
    if (isAvailable !== false) { // If not marked as unavailable
      availableRepos.push(repo);
    }
  }
  
  if (availableRepos.length === 0) {
    // Reset cache if all repos appear unavailable
    repoAvailabilityCache.clear();
    return GITHUB_REPOS[Math.floor(Math.random() * GITHUB_REPOS.length)];
  }
  
  // Load balancing: prefer repos with lower usage count
  availableRepos.sort((a, b) => {
    const usageA = repoUsageCount.get(a) || 0;
    const usageB = repoUsageCount.get(b) || 0;
    return usageA - usageB;
  });
  
  // Pick from top 3 least used repos for better distribution
  const topRepos = availableRepos.slice(0, Math.min(3, availableRepos.length));
  const selectedRepo = topRepos[Math.floor(Math.random() * topRepos.length)];
  
  // Increment usage count
  repoUsageCount.set(selectedRepo, (repoUsageCount.get(selectedRepo) || 0) + 1);
  
  return selectedRepo;
};

// Mark repo as unavailable for a period
const markRepoUnavailable = (repo) => {
  repoAvailabilityCache.set(repo, false);
  // Reset after 5 minutes
  setTimeout(() => {
    repoAvailabilityCache.set(repo, true);
  }, 5 * 60 * 1000);
};

// Enhanced image processing with compression
const processImage = async (imageSource, options = {}) => {
  try {
    let blob;
    
    if (imageSource instanceof Blob) {
      blob = imageSource;
    } else if (imageSource.startsWith('blob:')) {
      const response = await fetch(imageSource);
      blob = await response.blob();
    } else if (imageSource.startsWith('data:')) {
      const response = await fetch(imageSource);
      blob = await response.blob();
    } else {
      throw new Error('Unsupported image source type');
    }

    // Basic client-side compression
    if (options.maxSizeMB && blob.size > options.maxSizeMB * 1024 * 1024) {
      const compressedBlob = await compressImage(blob, options);
      blob = compressedBlob;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Simple client-side image compression
const compressImage = async (blob, { quality = 0.8, maxWidth = 1024, maxHeight = 1024 }) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height && width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      } else if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (compressedBlob) => resolve(compressedBlob || blob),
        blob.type || 'image/jpeg',
        quality
      );
      
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => resolve(blob); // Fallback to original if compression fails
    img.src = url;
  });
};

// Retry mechanism with exponential backoff
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

// GitHub API wrapper with better error handling
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
      // GitHub API error response
      const { status, data } = error.response;
      const errorMessage = data.message || 'GitHub API error';
      
      if (status === 403 && data.message.includes('API rate limit exceeded')) {
        throw new Error('GitHub rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`GitHub API error (${status}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('No response received from GitHub');
    } else {
      throw new Error(`GitHub request setup error: ${error.message}`);
    }
  }
};

// Check if a repository exists and is accessible
export const checkRepoAvailability = async (repo) => {
  try {
    await githubApiRequest(
      'get',
      `https://api.github.com/repos/${GITHUB_OWNER}/${repo}`
    );
    repoAvailabilityCache.set(repo, true);
    return true;
  } catch (error) {
    repoAvailabilityCache.set(repo, false);
    return false;
  }
};

// Get repository statistics
export const getRepoStats = async (repo) => {
  try {
    const [repoInfo, contents] = await Promise.all([
      githubApiRequest('get', `https://api.github.com/repos/${GITHUB_OWNER}/${repo}`),
      githubApiRequest('get', `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/profile_images`)
    ]);
    
    return {
      name: repo,
      size: repoInfo.size,
      fileCount: contents.length,
      available: true
    };
  } catch (error) {
    return {
      name: repo,
      size: 0,
      fileCount: 0,
      available: false,
      error: error.message
    };
  }
};

// Get all repos status
export const getAllReposStatus = async () => {
  const statuses = [];
  for (const repo of GITHUB_REPOS) {
    const stats = await getRepoStats(repo);
    statuses.push(stats);
  }
  return statuses;
};

// Reset usage counters (useful for load balancing)
export const resetUsageCounters = () => {
  GITHUB_REPOS.forEach(repo => {
    repoUsageCount.set(repo, 0);
  });
};

// Get current usage statistics
export const getUsageStats = () => {
  const stats = [];
  for (const repo of GITHUB_REPOS) {
    stats.push({
      repo,
      usageCount: repoUsageCount.get(repo) || 0,
      isAvailable: repoAvailabilityCache.get(repo) !== false
    });
  }
  return stats;
};

export const uploadImageToGitHub = async (imageSource, fileName, options = {}) => {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured');
  }

  return withRetry(async () => {
    let lastError;
    let attemptedRepos = [];
    
    // Try up to 3 different repos if one fails
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Process image with optional compression
        const base64Data = await processImage(imageSource, {
          maxSizeMB: 2, // Compress if > 2MB
          ...options
        });
        const content = base64Data.split(',')[1];

        // Get optimal repo (with load balancing)
        const repo = await getOptimalRepo();
        attemptedRepos.push(repo);
        
        const path = `profile_images/${fileName}.jpg`;
        const message = `Upload profile image ${fileName}`;
        const committer = {
          name: 'Profile Image Uploader',
          email: 'noreply@apogi.com'
        };

        // Upload with timeout
        await githubApiRequest(
          'put',
          `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
          { message, content, committer }
        );

        // Success - return URL
        return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/main/${path}?t=${Date.now()}`;
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt ${attempt + 1} failed for repo ${attemptedRepos[attempt]}:`, error);
        
        // Mark the failed repo as potentially unavailable
        if (attemptedRepos[attempt]) {
          markRepoUnavailable(attemptedRepos[attempt]);
        }
        
        // If this wasn't the last attempt, continue to next repo
        if (attempt < 2) {
          continue;
        }
      }
    }
    
    // All attempts failed
    throw lastError || new Error('Failed to upload after multiple attempts');
  });
};

export const deleteImageFromGitHub = async (imageUrl) => {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured');
  }

  return withRetry(async () => {
    try {
      const urlParts = imageUrl.split('/');
      const repoIndex = urlParts.indexOf('raw.githubusercontent.com') + 1;
      const repo = urlParts[repoIndex + 1];
      const path = urlParts.slice(repoIndex + 3).join('/').split('?')[0];

      // Get file info first
      const fileInfo = await githubApiRequest(
        'get',
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`
      );

      // Delete the file
      await githubApiRequest(
        'delete',
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`,
        {
          message: `Delete profile image ${path}`,
          sha: fileInfo.sha,
          committer: {
            name: 'Profile Image Uploader',
            email: 'noreply@aediax.com'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      if (error.message.includes('Not Found')) {
        return true; // Already deleted
      }
      throw error;
    }
  });
};

// Utility to check if image exists before deletion
export const checkImageExistsOnGitHub = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const repoIndex = urlParts.indexOf('raw.githubusercontent.com') + 1;
    const repo = urlParts[repoIndex + 1];
    const path = urlParts.slice(repoIndex + 3).join('/').split('?')[0];

    await githubApiRequest(
      'get',
      `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/contents/${path}`
    );
    return true;
  } catch (error) {
    if (error.message.includes('Not Found')) {
      return false;
    }
    throw error;
  }
};
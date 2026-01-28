import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

class GCSService {
  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || 'veoflow-videos';
    this.keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    // Initialize Google Cloud Storage
    this.storage = new Storage({
      keyFilename: this.keyFilePath,
      projectId: process.env.GOOGLE_PROJECT_ID || 'veoflow-485315',
    });
    
    this.bucket = this.storage.bucket(this.bucketName);
    
    console.log('GCS Service initialized:', {
      bucket: this.bucketName,
      hasKeyFile: !!this.keyFilePath,
    });
  }

  /**
   * Upload video file to GCS
   * @param {string} localFilePath - Path to local video file
   * @param {string} projectId - Project ID for organizing files
   * @returns {Promise<{fileName: string, signedUrl: string}>} - GCS filename and signed URL
   */
  async uploadVideo(localFilePath, projectId) {
    try {
      if (!fs.existsSync(localFilePath)) {
        throw new Error(`File not found: ${localFilePath}`);
      }

      // Generate unique filename: videos/{projectId}/{timestamp}.mp4
      const timestamp = Date.now();
      const fileName = `videos/${projectId}/${timestamp}.mp4`;
      
      // Upload file to GCS
      await this.bucket.upload(localFilePath, {
        destination: fileName,
        metadata: {
          contentType: 'video/mp4',
          cacheControl: 'public, max-age=31536000', // Cache for 1 year
        },
        // Don't use public: true with uniform bucket-level access
        // Public access is already granted via bucket permissions
      });

      // Generate signed URL (valid for 24 hours)
      const signedUrl = await this.getSignedUrl(fileName, 86400); // 24 hours
      
      console.log('Video uploaded to GCS:', fileName);
      console.log('Signed URL generated (valid 24h)');
      
      // KEEP local file as cache/fallback for reliability
      // If signed URL fails or GCS is down, we can still serve from local
      // This provides the best of both worlds:
      // - Fast GCS CDN delivery via signed URLs
      // - Local fallback if GCS has issues
      console.log('Local file kept as fallback:', localFilePath);
      
      return { fileName, signedUrl };
    } catch (error) {
      console.error('GCS upload error:', error);
      throw new Error(`Failed to upload video to GCS: ${error.message}`);
    }
  }

  /**
   * Get signed URL for private video access (alternative to public URLs)
   * @param {string} fileName - GCS file path
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(fileName, expiresIn = 3600) {
    try {
      const [url] = await this.bucket.file(fileName).getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });
      
      return url;
    } catch (error) {
      console.error('GCS signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete video from GCS
   * @param {string} videoUrl - Public URL or GCS path
   */
  async deleteVideo(videoUrl) {
    try {
      // Extract filename from URL
      // https://storage.googleapis.com/veoflow-videos/videos/{projectId}/{timestamp}.mp4
      const fileName = videoUrl.split(`${this.bucketName}/`)[1];
      
      if (!fileName) {
        throw new Error('Invalid video URL format');
      }
      
      await this.bucket.file(fileName).delete();
      console.log('Video deleted from GCS:', fileName);
    } catch (error) {
      console.error('GCS delete error:', error);
      throw new Error(`Failed to delete video from GCS: ${error.message}`);
    }
  }

  /**
   * List all videos for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} - Array of video URLs
   */
  async listProjectVideos(projectId) {
    try {
      const [files] = await this.bucket.getFiles({
        prefix: `videos/${projectId}/`,
      });
      
      const videoUrls = files.map(file => 
        `https://storage.googleapis.com/${this.bucketName}/${file.name}`
      );
      
      return videoUrls;
    } catch (error) {
      console.error('GCS list error:', error);
      throw new Error(`Failed to list videos: ${error.message}`);
    }
  }
}

export default new GCSService();

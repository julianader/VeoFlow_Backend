import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

class GoogleTTSService {
  constructor() {
    this.keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    this.projectId = process.env.GOOGLE_PROJECT_ID || 'veoflow-485315';
    
    // Initialize Text-to-Speech client with service account
    if (this.keyFilePath) {
      this.client = new TextToSpeechClient({
        keyFilename: this.keyFilePath,
        projectId: this.projectId,
      });
      console.log('Google Text-to-Speech initialized with service account');
    } else {
      console.warn('Google Text-to-Speech not initialized - no credentials found');
    }
  }

  /**
   * Generate speech from text using Google Cloud Text-to-Speech
   */
  async generateSpeech(text, options = {}) {
    try {
      if (!this.client) {
        throw new Error('Google Text-to-Speech not configured. Check GOOGLE_APPLICATION_CREDENTIALS in .env');
      }

      const {
        voiceName = 'en-US-Neural2-A',
        rate = 1.0,
        pitch = 0,
      } = options;

      const request = {
        input: { text: text },
        voice: {
          languageCode: 'en-US',
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: pitch,
          speakingRate: rate,
        },
      };

      const [response] = await this.client.synthesizeSpeech(request);

      if (response.audioContent) {
        return {
          success: true,
          audioContent: response.audioContent,
          audioEncoding: 'MP3',
        };
      }

      throw new Error('No audio content in response');
    } catch (error) {
      if (error.code === 7) { // PERMISSION_DENIED
        throw new Error('Text-to-Speech API not enabled. Visit https://console.cloud.google.com/apis/library/texttospeech.googleapis.com and enable it for your project.');
      }
      throw new Error(`Text-to-speech synthesis failed: ${error.message}`);
    }
  }

  /**
   * Save audio content to file
   */
  async saveAudioToFile(audioContent, filename) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      
      // audioContent is already a Buffer when using the client library
      const buffer = Buffer.isBuffer(audioContent) 
        ? audioContent 
        : Buffer.from(audioContent, 'base64');
        
      fs.writeFileSync(filePath, buffer);

      return filePath;
    } catch (error) {
      throw new Error(`Failed to save audio file: ${error.message}`);
    }
  }

  /**
   * List available voices
   */
  async listVoices() {
    try {
      if (!this.client) {
        throw new Error('Google Text-to-Speech not configured');
      }

      const [response] = await this.client.listVoices({});

      return response.voices.filter(
        (voice) => voice.languageCodes[0] === 'en-US'
      );
    } catch (error) {
      throw new Error(`Failed to list voices: ${error.message}`);
    }
  }

  /**
   * Get voice details
   */
  getVoiceDetails(voiceName) {
    const voices = {
      'en-US-Neural2-A': {
        name: 'en-US-Neural2-A',
        gender: 'FEMALE',
        naturalSampleRateHertz: 24000,
      },
      'en-US-Neural2-C': {
        name: 'en-US-Neural2-C',
        gender: 'MALE',
        naturalSampleRateHertz: 24000,
      },
      'en-US-Neural2-E': {
        name: 'en-US-Neural2-E',
        gender: 'MALE',
        naturalSampleRateHertz: 24000,
      },
      'en-US-Neural2-F': {
        name: 'en-US-Neural2-F',
        gender: 'FEMALE',
        naturalSampleRateHertz: 24000,
      },
    };

    return voices[voiceName] || voices['en-US-Neural2-A'];
  }

  /**
   * Calculate estimated duration of speech
   */
  estimateDuration(text, rate = 1.0) {
    // Average speaking rate: ~150 words per minute
    const words = text.split(' ').length;
    const baseMinutes = words / 150;
    const adjustedMinutes = baseMinutes / rate;
    return Math.ceil(adjustedMinutes * 60 * 1000); // return milliseconds
  }
}

export const googleTTSService = new GoogleTTSService();

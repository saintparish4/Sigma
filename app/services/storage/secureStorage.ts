import * as SecureStore from 'expo-secure-store';
// import * as Crypto from 'expo-crypto';

interface SecureStorageOptions {
  requireAuthentication?: boolean;
  encrypt?: boolean;
}

class SecureStorageService {
  private static instance: SecureStorageService;
  private encryptionKey: string;

  private constructor() {
    // In production, this should come from a secure key derivation process
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key';
  }

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  private async encrypt(data: string): Promise<string> {
    try {
      // Simple XOR encryption - in production use proper AES
      const encrypted = Buffer.from(data)
        .map((byte, index) => byte ^ this.encryptionKey.charCodeAt(index % this.encryptionKey.length))
        .toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    try {
      const decrypted = Buffer.from(encryptedData, 'base64')
        .map((byte, index) => byte ^ this.encryptionKey.charCodeAt(index % this.encryptionKey.length))
        .toString();
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to original data
    }
  }

  async setItem(
    key: string, 
    value: string, 
    options: SecureStorageOptions = {}
  ): Promise<void> {
    try {
      const { encrypt = true, requireAuthentication = false } = options;
      
      let dataToStore = value;
      if (encrypt) {
        dataToStore = await this.encrypt(value);
      }

      await SecureStore.setItemAsync(key, dataToStore, {
        requireAuthentication,
      });
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      throw new Error(`Failed to store secure data for ${key}`);
    }
  }

  async getItem(
    key: string, 
    options: SecureStorageOptions = {}
  ): Promise<string | null> {
    try {
      const { encrypt = true, requireAuthentication = false } = options;
      
      const storedData = await SecureStore.getItemAsync(key, {
        requireAuthentication,
      });

      if (!storedData) {
        return null;
      }

      if (encrypt) {
        return await this.decrypt(storedData);
      }

      return storedData;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw new Error(`Failed to remove secure data for ${key}`);
    }
  }

  async clear(): Promise<void> {
    // SecureStore doesn't have a clear all method
    // We'll need to track keys separately
    const keysToRemove = [
      'access_token',
      'refresh_token', 
      'user_data',
      'company_data',
      'mfa_secret',
    ];

    await Promise.all(
      keysToRemove.map(key => this.removeItem(key))
    );
  }

  // Token-specific methods
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setItem('access_token', accessToken),
      this.setItem('refresh_token', refreshToken),
    ]);
  }

  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem('access_token'),
      this.getItem('refresh_token'),
    ]);

    return { accessToken, refreshToken };
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      this.removeItem('access_token'),
      this.removeItem('refresh_token'),
    ]);
  }
}

export default SecureStorageService.getInstance();
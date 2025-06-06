import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export class FirebaseStorageService {
  // Upload file
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              reject(new Error(`Upload failed: ${error.message}`));
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (error: any) {
                reject(new Error(`Failed to get download URL: ${error.message}`));
              }
            }
          );
        });
      } else {
        // Simple upload
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (error: any) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Upload avatar
  static async uploadAvatar(userId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const path = `avatars/${userId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Upload character image
  static async uploadCharacterImage(userId: string, characterId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const path = `characters/${userId}/${characterId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Upload game screenshot
  static async uploadGameScreenshot(userId: string, sessionId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const path = `screenshots/${userId}/${sessionId}/${Date.now()}_${file.name}`;
    return this.uploadFile(file, path, onProgress);
  }

  // Delete file
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // Get file metadata
  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error: any) {
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  // List files in directory
  static async listFiles(path: string) {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            url,
            metadata,
          };
        })
      );
      
      return files;
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Get download URL
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      throw new Error(`Failed to get download URL: ${error.message}`);
    }
  }
}
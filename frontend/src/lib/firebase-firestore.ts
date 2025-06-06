import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD operations
export class FirestoreService {
  // Create document
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  // Get document by ID
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error: any) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  }

  // Get all documents
  static async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error: any) {
      throw new Error(`Error getting documents: ${error.message}`);
    }
  }

  // Update document
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  // Delete document
  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  // Real-time listener
  static onSnapshot(
    collectionName: string,
    callback: (data: DocumentData[]) => void,
    constraints: QueryConstraint[] = []
  ) {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  }
}

// Game-specific Firestore operations
export class GameFirestoreService {
  // User profiles
  static async createUserProfile(userId: string, userData: any) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      // If document doesn't exist, create it
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }

  static async getUserProfile(userId: string) {
    return FirestoreService.getById('users', userId);
  }

  // Game sessions backup
  static async backupGameSession(sessionData: any) {
    return FirestoreService.create('game_sessions_backup', sessionData);
  }

  static async getUserGameSessions(userId: string) {
    return FirestoreService.getAll('game_sessions_backup', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ]);
  }

  // Characters backup
  static async backupCharacter(characterData: any) {
    return FirestoreService.create('characters_backup', characterData);
  }

  static async getUserCharacters(userId: string) {
    return FirestoreService.getAll('characters_backup', [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ]);
  }

  // Game statistics
  static async updateGameStats(userId: string, stats: any) {
    const docRef = doc(db, 'game_stats', userId);
    return updateDoc(docRef, {
      ...stats,
      updatedAt: Timestamp.now(),
    });
  }

  static async getGameStats(userId: string) {
    return FirestoreService.getById('game_stats', userId);
  }
}
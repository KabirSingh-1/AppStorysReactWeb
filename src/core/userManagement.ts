import { WebStorage } from '../adapters/web/storage';

const ANONYMOUS_USER_KEY = 'anonymous_user_id';

export async function generateAnonymousUserId(): Promise<string> {
  const currentTimeMs = Date.now();
  const browserName = navigator.userAgent.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
  return `${currentTimeMs}_${browserName}`;
}

export async function getOrCreateAnonymousUserId(): Promise<string> {
  try {
    const storedUserId = await WebStorage.getItem(ANONYMOUS_USER_KEY);
    
    if (storedUserId) {
      return storedUserId;
    }
    
    const newUserId = await generateAnonymousUserId();
    await WebStorage.setItem(ANONYMOUS_USER_KEY, newUserId);
    return newUserId;
  } catch (error) {
    console.error('Error managing anonymous user ID:', error);
    return await generateAnonymousUserId();
  }
}

export async function clearAnonymousUserId(): Promise<void> {
  try {
    await WebStorage.removeItem(ANONYMOUS_USER_KEY);
  } catch (error) {
    console.error('Error clearing anonymous user ID:', error);
  }
}

export async function getStoredAnonymousUserId(): Promise<string | null> {
  try {
    return await WebStorage.getItem(ANONYMOUS_USER_KEY);
  } catch (error) {
    console.error('Error getting stored anonymous user ID:', error);
    return null;
  }
}

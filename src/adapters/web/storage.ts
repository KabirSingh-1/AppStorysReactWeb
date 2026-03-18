export class WebStorage {
  static async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Fallback for private mode or full storage
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

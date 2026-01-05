import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface FileSystemItem {
  name: string;
  path: string;
  type: 'directory' | 'drive';
  hasChildren: boolean;
  size: number;
  lastModified: string;
  accessible: boolean;
}

export interface PathValidationResponse {
  valid: boolean;
  path: string;
  error?: string;
}

const fileSystemService = {
  /**
   * Lista las unidades/raíces del sistema
   */
  async listRoots(): Promise<FileSystemItem[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/filesystem/roots`);
      return response.data;
    } catch (error) {
      console.error('Error listing roots:', error);
      throw error;
    }
  },

  /**
   * Lista el contenido de un directorio
   */
  async listDirectory(path: string): Promise<FileSystemItem[]> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/filesystem/list`, {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  },

  /**
   * Valida si una ruta es válida y accesible
   */
  async validatePath(path: string): Promise<PathValidationResponse> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/filesystem/validate`, {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating path:', error);
      return { valid: false, path, error: 'Error de conexión' };
    }
  },

  /**
   * Obtiene información de un directorio específico
   */
  async getDirectoryInfo(path: string): Promise<FileSystemItem | null> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/filesystem/info`, {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting directory info:', error);
      return null;
    }
  },

  /**
   * Obtiene el directorio padre
   */
  async getParentDirectory(path: string): Promise<FileSystemItem | null> {
    try {
      const response = await axios.get(`${API_URL}/api/v1/filesystem/parent`, {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting parent directory:', error);
      return null;
    }
  }
};

export default fileSystemService;

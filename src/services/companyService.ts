import axios from 'axios';

// Definir la URL base del API
const API_BASE_URL = 'http://localhost:8080';
const COMPANY_API_URL = `${API_BASE_URL}/api/v1`;

// Interfaces para los datos de empresas y sedes
export interface Company {
  id: number;
  name: string;
  active: boolean;
  headquarters?: Headquarter[];
}

export interface Headquarter {
  id: number;
  name: string;
  active: boolean;
  companyId: number;
}

// Servicio para manejar las operaciones relacionadas con empresas y sedes
const companyService = {
  // Obtener todas las empresas
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/companies`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw error;
    }
  },

  // Obtener una empresa por su ID
  getCompanyById: async (id: number): Promise<Company> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/companies/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la empresa con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva empresa
  createCompany: async (company: Omit<Company, 'id'>): Promise<Company> => {
    try {
      const response = await axios.post(`${COMPANY_API_URL}/companies`, company, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear empresa:', error);
      throw error;
    }
  },

  // Actualizar una empresa existente
  updateCompany: async (id: number, company: Partial<Company>): Promise<Company> => {
    try {
      const response = await axios.put(`${COMPANY_API_URL}/companies/${id}`, company, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la empresa con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener todas las sedes
  getAllHeadquarters: async (): Promise<Headquarter[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener sedes:', error);
      throw error;
    }
  },

  // Obtener sedes por ID de empresa
  getHeadquartersByCompanyId: async (companyId: number): Promise<Headquarter[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/company/${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener sedes para la empresa ${companyId}:`, error);
      throw error;
    }
  },

  // Obtener una sede por su ID
  getHeadquarterById: async (id: number): Promise<Headquarter> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la sede con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva sede
  createHeadquarter: async (headquarter: Omit<Headquarter, 'id'>): Promise<Headquarter> => {
    try {
      const response = await axios.post(`${COMPANY_API_URL}/headquarters`, headquarter, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear sede:', error);
      throw error;
    }
  },

  // Actualizar una sede existente
  updateHeadquarter: async (id: number, headquarter: Partial<Headquarter>): Promise<Headquarter> => {
    try {
      const response = await axios.put(`${COMPANY_API_URL}/headquarters/${id}`, headquarter, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la sede con ID ${id}:`, error);
      throw error;
    }
  }
};

export default companyService;

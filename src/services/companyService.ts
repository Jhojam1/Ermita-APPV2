import axios from 'axios';

// Definir la URL base del API
const API_BASE_URL = 'http://192.168.2.20:8080';
const COMPANY_API_URL = `${API_BASE_URL}/api/v1`;

// Interfaces para los datos de ciudades, empresas y sedes
export interface City {
  id: number;
  name: string;
  department: string;
  country: string;
  active: boolean;
}

// Nueva interfaz para la relación empresa-ciudad
export interface CompanyCity {
  id: number;
  companyId: number;
  companyName: string;
  cityId: number;
  cityName: string;
  department: string;
  isPrimary: boolean;
  active: boolean;
}

// Nueva interfaz para la relación sede-empresa
export interface HeadquarterCompany {
  id: number;
  headquarterId: number;
  headquarterName: string;
  headquarterAddress?: string;
  companyId: number;
  companyName: string;
  active: boolean;
}

export interface Company {
  id: number;
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  cities?: CompanyCity[]; // Múltiples ciudades
  headquarters?: HeadquarterCompany[]; // Múltiples sedes
}

export interface Headquarter {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  cityId: number; // Ciudad donde está ubicada la sede
  cityName?: string;
  cityDepartment?: string;
  companies?: HeadquarterCompany[]; // Múltiples empresas
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
  },

  // ===== MÉTODOS PARA CIUDADES =====
  
  // Obtener todas las ciudades
  getAllCities: async (): Promise<City[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/cities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      throw error;
    }
  },

  // Obtener una ciudad por su ID
  getCityById: async (id: number): Promise<City> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/cities/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener la ciudad con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear una nueva ciudad
  createCity: async (city: Omit<City, 'id'>): Promise<City> => {
    try {
      const response = await axios.post(`${COMPANY_API_URL}/cities`, city, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear ciudad:', error);
      throw error;
    }
  },

  // Actualizar una ciudad existente
  updateCity: async (id: number, city: Partial<City>): Promise<City> => {
    try {
      const response = await axios.put(`${COMPANY_API_URL}/cities/${id}`, city, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar la ciudad con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener ciudades por departamento
  getCitiesByDepartment: async (department: string): Promise<City[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/cities/department/${department}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ciudades del departamento ${department}:`, error);
      throw error;
    }
  },

  // Obtener empresas por ciudad
  getCompaniesByCity: async (cityId: number): Promise<Company[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/companies/city/${cityId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener empresas de la ciudad ${cityId}:`, error);
      throw error;
    }
  },

  // ===== MÉTODOS PARA RELACIONES MUCHOS A MUCHOS =====

  // Agregar ciudad a empresa
  addCityToCompany: async (companyId: number, cityId: number, isPrimary: boolean = false): Promise<CompanyCity> => {
    try {
      const response = await axios.post(
        `${COMPANY_API_URL}/companies/${companyId}/cities`,
        { cityId, isPrimary },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar ciudad a empresa:', error);
      throw error;
    }
  },

  // Obtener ciudades de una empresa
  getCitiesByCompany: async (companyId: number): Promise<CompanyCity[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/companies/${companyId}/cities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciudades de empresa:', error);
      throw error;
    }
  },

  // Marcar ciudad como principal
  setPrimaryCity: async (companyId: number, cityId: number): Promise<CompanyCity> => {
    try {
      const response = await axios.put(
        `${COMPANY_API_URL}/companies/${companyId}/cities/${cityId}/primary`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al marcar ciudad como principal:', error);
      throw error;
    }
  },

  // Remover ciudad de empresa
  removeCityFromCompany: async (companyId: number, cityId: number): Promise<void> => {
    try {
      await axios.delete(`${COMPANY_API_URL}/companies/${companyId}/cities/${cityId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error al remover ciudad de empresa:', error);
      throw error;
    }
  },

  // Agregar empresa a sede
  addCompanyToHeadquarter: async (
    headquarterId: number,
    companyId: number
  ): Promise<HeadquarterCompany> => {
    try {
      const response = await axios.post(
        `${COMPANY_API_URL}/headquarters/${headquarterId}/companies`,
        { companyId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al agregar empresa a sede:', error);
      throw error;
    }
  },

  // Obtener empresas de una sede
  getCompaniesByHeadquarter: async (headquarterId: number): Promise<HeadquarterCompany[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/${headquarterId}/companies`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener empresas de sede:', error);
      throw error;
    }
  },

  // Obtener sedes de una empresa (nueva relación M:N)
  getHeadquartersByCompanyNew: async (companyId: number): Promise<HeadquarterCompany[]> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/by-company/${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener sedes de empresa:', error);
      throw error;
    }
  },

  // Remover empresa de sede
  removeCompanyFromHeadquarter: async (headquarterId: number, companyId: number): Promise<void> => {
    try {
      await axios.delete(`${COMPANY_API_URL}/headquarters/${headquarterId}/companies/${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error al remover empresa de sede:', error);
      throw error;
    }
  },

  // Obtener estadísticas de sede
  getHeadquarterStats: async (headquarterId: number): Promise<{ companyCount: number }> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/${headquarterId}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de sede:', error);
      throw error;
    }
  },

  // Obtener estadísticas de empresa
  getCompanyStats: async (companyId: number): Promise<{ headquarterCount: number }> => {
    try {
      const response = await axios.get(`${COMPANY_API_URL}/headquarters/company-stats/${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de empresa:', error);
      throw error;
    }
  }
};

export default companyService;

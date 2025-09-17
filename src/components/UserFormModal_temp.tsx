import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserItem } from '../services/userService';
import companyService, { Company, Headquarter } from '../services/companyService';
import SignaturePad from './SignatureCanvas';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserItem) => void;
  user?: UserItem;
  isEditing?: boolean;
}

export default function UserFormModal({ isOpen, onClose, onSave, user, isEditing = false }: UserFormModalProps) {
  const [formData, setFormData] = useState<UserItem>({
    fullName: '',
    numberIdentification: 0,
    state: 'Activo',
    mail: '',
    password: '',
    numberPhone: '',
    role: 'Usuario',
    companyId: undefined,
    headquarterId: undefined,
    signature: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Cargar empresas al montar el componente
  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);
  
  // Cargar sedes cuando cambia la empresa seleccionada
  useEffect(() => {
    if (formData.companyId) {
      fetchHeadquarters(formData.companyId);
    }
  }, [formData.companyId]);

  useEffect(() => {
    if (user && isEditing) {
      console.log('Datos recibidos para edición:', user);
      setFormData({
        ...user,
        password: '', // No mostrar la contraseña por seguridad
      });
    } else {
      // Valores por defecto para nuevo usuario
      setFormData({
        fullName: '',
        numberIdentification: 0,
        state: 'Activo',
        mail: '',
        password: '',
        numberPhone: '',
        role: 'Usuario',
        companyId: undefined,
        headquarterId: undefined,
        signature: undefined,
      });
    }
  }, [user, isEditing, isOpen]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await companyService.getAllCompanies();
      setCompanies(data);
      
      // Si hay empresas y no hay una seleccionada, seleccionar la primera
      if (data.length > 0 && !formData.companyId) {
        setFormData(prev => ({
          ...prev,
          companyId: data[0].id
        }));
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeadquarters = async (companyId: number) => {
    try {
      setIsLoading(true);
      const data = await companyService.getHeadquartersByCompanyId(companyId);
      setHeadquarters(data);
      
      // Si hay sedes y no hay una seleccionada, o la seleccionada no pertenece a esta empresa,
      // seleccionar la primera sede de esta empresa
      if (data.length > 0) {
        const currentHeadquarterBelongsToCompany = data.some(h => h.id === formData.headquarterId);
        if (!formData.headquarterId || !currentHeadquarterBelongsToCompany) {
          setFormData(prev => ({
            ...prev,
            headquarterId: data[0].id
          }));
        }
      }
    } catch (error) {
      console.error(`Error al cargar sedes para la empresa ${companyId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'numberIdentification') {
      // Validar que sea un número
      if (value === '' || /^\\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value === '' ? 0 : parseInt(value),
        });
      }
    } else if (name === 'companyId' || name === 'headquarterId') {
      // Manejar valores numéricos
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else {
      // Manejar valores de texto
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Limpiar error si el campo se ha llenado
    if (errors[name] && value) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Manejador específico para la firma digital
  const handleSignatureChange = (signature: string | undefined) => {
    setFormData({
      ...formData,
      signature,
    });
    
    // Limpiar error si se ha añadido una firma
    if (errors.signature && signature) {
      setErrors({
        ...errors,
        signature: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }
    
    if (!formData.mail.trim()) {
      newErrors.mail = 'El correo electrónico es requerido';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.mail)) {
      newErrors.mail = 'El correo electrónico no es válido';
    }
    
    if (!isEditing && !formData.password?.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    if (formData.numberIdentification === 0) {
      newErrors.numberIdentification = 'El número de identificación es requerido';
    }
    
    if (!formData.companyId) {
      newErrors.companyId = 'La empresa es requerida';
    }
    
    if (!formData.headquarterId) {
      newErrors.headquarterId = 'La sede es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Asegurarse de que companyId y headquarterId sean números
      const dataToSave = {
        ...formData,
        companyId: formData.companyId ? Number(formData.companyId) : undefined,
        headquarterId: formData.headquarterId ? Number(formData.headquarterId) : undefined,
      };
      
      console.log('Datos a guardar desde el formulario:', dataToSave);
      onSave(dataToSave);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="mail"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.mail ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={isEditing}
                readOnly={isEditing}
              />
              {errors.mail && (
                <p className="mt-1 text-sm text-red-600">{errors.mail}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">El correo electrónico no se puede modificar</p>
              )}
            </div>
            
            {!isEditing && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="numberIdentification" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Identificación *
              </label>
              <input
                type="text"
                id="numberIdentification"
                name="numberIdentification"
                value={formData.numberIdentification === 0 ? '' : formData.numberIdentification}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.numberIdentification ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={isEditing}
                readOnly={isEditing}
              />
              {errors.numberIdentification && (
                <p className="mt-1 text-sm text-red-600">{errors.numberIdentification}</p>
              )}
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500">El número de identificación no se puede modificar</p>
              )}
            </div>
            
            <div>
              <label htmlFor="numberPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono
              </label>
              <input
                type="text"
                id="numberPhone"
                name="numberPhone"
                value={formData.numberPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Administrador">Administrador</option>
                <option value="Tecnico">Técnico</option>
                <option value="Usuario">Usuario</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                id="companyId"
                name="companyId"
                value={formData.companyId || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.companyId ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={isLoading || companies.length === 0}
              >
                <option value="">Seleccionar empresa</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>
              )}
              {isLoading && (
                <p className="mt-1 text-sm text-gray-500">Cargando empresas...</p>
              )}
            </div>
            
            <div>
              <label htmlFor="headquarterId" className="block text-sm font-medium text-gray-700 mb-1">
                Sede *
              </label>
              <select
                id="headquarterId"
                name="headquarterId"
                value={formData.headquarterId || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.headquarterId ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                disabled={isLoading || !formData.companyId || headquarters.length === 0}
              >
                <option value="">Seleccionar sede</option>
                {headquarters.map(headquarter => (
                  <option key={headquarter.id} value={headquarter.id}>
                    {headquarter.name}
                  </option>
                ))}
              </select>
              {errors.headquarterId && (
                <p className="mt-1 text-sm text-red-600">{errors.headquarterId}</p>
              )}
              {isLoading && formData.companyId && (
                <p className="mt-1 text-sm text-gray-500">Cargando sedes...</p>
              )}
              {!formData.companyId && (
                <p className="mt-1 text-sm text-gray-500">Primero seleccione una empresa</p>
              )}
            </div>
            
            {isEditing && (
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>
          
          {/* Campo de firma digital solo para técnicos */}
          {formData.role === 'Tecnico' && (
            <div className="mb-6">
              <SignaturePad
                value={formData.signature}
                onChange={handleSignatureChange}
                label="Firma Digital del Técnico"
                required={false}
              />
              {errors.signature && (
                <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

# Frontend - Relaciones Muchos a Muchos

## 📋 Resumen

Implementación del frontend React para gestionar relaciones **muchos a muchos** entre:
- ✅ **Empresas ↔ Ciudades**
- ✅ **Sedes ↔ Empresas**

---

## 🔧 Componentes Creados

### 1. **ManageCompanyCitiesModal.tsx**

Modal para gestionar las ciudades donde opera una empresa.

**Características:**
- ✅ Listar ciudades actuales de la empresa
- ✅ Agregar nuevas ciudades
- ✅ Marcar ciudad como principal (⭐)
- ✅ Remover ciudades (con validaciones)
- ✅ Indicador visual de ciudad principal

**Props:**
```typescript
interface ManageCompanyCitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  onUpdate: () => void; // Callback para refrescar datos
}
```

**Uso:**
```tsx
import ManageCompanyCitiesModal from '../components/company/ManageCompanyCitiesModal';

const [showCitiesModal, setShowCitiesModal] = useState(false);
const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

// Abrir modal
<button onClick={() => {
  setSelectedCompany(company);
  setShowCitiesModal(true);
}}>
  Gestionar Ciudades
</button>

// Renderizar modal
<ManageCompanyCitiesModal
  isOpen={showCitiesModal}
  onClose={() => setShowCitiesModal(false)}
  companyId={selectedCompany?.id || 0}
  companyName={selectedCompany?.name || ''}
  onUpdate={() => {
    // Refrescar lista de empresas
    loadCompanies();
  }}
/>
```

---

### 2. **ManageHeadquarterCompaniesModal.tsx**

Modal para gestionar las empresas que ocupan una sede (edificio compartido).

**Características:**
- ✅ Listar empresas en la sede
- ✅ Agregar empresas con detalles (piso, oficina, área)
- ✅ Editar detalles de empresa en sede
- ✅ Remover empresas de la sede
- ✅ Validación de datos

**Props:**
```typescript
interface ManageHeadquarterCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  headquarterId: number;
  headquarterName: string;
  onUpdate: () => void;
}
```

**Uso:**
```tsx
import ManageHeadquarterCompaniesModal from '../components/company/ManageHeadquarterCompaniesModal';

const [showCompaniesModal, setShowCompaniesModal] = useState(false);
const [selectedHeadquarter, setSelectedHeadquarter] = useState<Headquarter | null>(null);

// Abrir modal
<button onClick={() => {
  setSelectedHeadquarter(headquarter);
  setShowCompaniesModal(true);
}}>
  Gestionar Empresas
</button>

// Renderizar modal
<ManageHeadquarterCompaniesModal
  isOpen={showCompaniesModal}
  onClose={() => setShowCompaniesModal(false)}
  headquarterId={selectedHeadquarter?.id || 0}
  headquarterName={selectedHeadquarter?.name || ''}
  onUpdate={() => {
    // Refrescar lista de sedes
    loadHeadquarters();
  }}
/>
```

---

## 📡 Servicio TypeScript Actualizado

### **companyService.ts**

#### Nuevas Interfaces

```typescript
// Relación empresa-ciudad
export interface CompanyCity {
  id: number;
  companyId: number;
  companyName: string;
  cityId: number;
  cityName: string;
  department: string;
  isPrimary: boolean; // Ciudad principal
  active: boolean;
}

// Relación sede-empresa
export interface HeadquarterCompany {
  id: number;
  headquarterId: number;
  headquarterName: string;
  headquarterAddress?: string;
  companyId: number;
  companyName: string;
  floor?: string;      // Piso
  office?: string;     // Oficina
  area?: number;       // Área en m²
  active: boolean;
}

// Empresa actualizada
export interface Company {
  id: number;
  name: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  cities?: CompanyCity[];           // Múltiples ciudades
  headquarters?: HeadquarterCompany[]; // Múltiples sedes
}

// Sede actualizada
export interface Headquarter {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  cityId: number;                   // Ciudad donde está ubicada
  cityName?: string;
  cityDepartment?: string;
  companies?: HeadquarterCompany[]; // Múltiples empresas
}
```

#### Nuevos Métodos

**Gestión Empresa-Ciudad:**
```typescript
// Agregar ciudad a empresa
addCityToCompany(companyId: number, cityId: number, isPrimary?: boolean): Promise<CompanyCity>

// Obtener ciudades de empresa
getCitiesByCompany(companyId: number): Promise<CompanyCity[]>

// Marcar ciudad como principal
setPrimaryCity(companyId: number, cityId: number): Promise<CompanyCity>

// Remover ciudad de empresa
removeCityFromCompany(companyId: number, cityId: number): Promise<void>
```

**Gestión Sede-Empresa:**
```typescript
// Agregar empresa a sede
addCompanyToHeadquarter(
  headquarterId: number, 
  companyId: number, 
  floor?: string, 
  office?: string, 
  area?: number
): Promise<HeadquarterCompany>

// Obtener empresas de sede
getCompaniesByHeadquarter(headquarterId: number): Promise<HeadquarterCompany[]>

// Obtener sedes de empresa
getHeadquartersByCompanyNew(companyId: number): Promise<HeadquarterCompany[]>

// Actualizar detalles sede-empresa
updateHeadquarterCompanyDetails(
  headquarterId: number, 
  companyId: number, 
  floor?: string, 
  office?: string, 
  area?: number
): Promise<HeadquarterCompany>

// Remover empresa de sede
removeCompanyFromHeadquarter(headquarterId: number, companyId: number): Promise<void>

// Estadísticas
getHeadquarterStats(headquarterId: number): Promise<{ companyCount: number; totalArea: number }>
getCompanyStats(companyId: number): Promise<{ headquarterCount: number; totalArea: number }>
```

---

## 💡 Ejemplos de Integración

### **Ejemplo 1: Botón en tabla de empresas**

```tsx
// En Companies.tsx o similar
import ManageCompanyCitiesModal from '../components/company/ManageCompanyCitiesModal';

export default function Companies() {
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <>
      <table>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td>{company.name}</td>
              <td>
                {/* Mostrar ciudades */}
                {company.cities?.map(cc => (
                  <span key={cc.id} className="badge">
                    {cc.cityName} {cc.isPrimary && '⭐'}
                  </span>
                ))}
              </td>
              <td>
                <button onClick={() => {
                  setSelectedCompany(company);
                  setShowCitiesModal(true);
                }}>
                  Gestionar Ciudades
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ManageCompanyCitiesModal
        isOpen={showCitiesModal}
        onClose={() => setShowCitiesModal(false)}
        companyId={selectedCompany?.id || 0}
        companyName={selectedCompany?.name || ''}
        onUpdate={loadCompanies}
      />
    </>
  );
}
```

### **Ejemplo 2: Mostrar ciudades de empresa**

```tsx
// Componente para mostrar ciudades
function CompanyCitiesBadges({ companyId }: { companyId: number }) {
  const [cities, setCities] = useState<CompanyCity[]>([]);

  useEffect(() => {
    companyService.getCitiesByCompany(companyId).then(setCities);
  }, [companyId]);

  return (
    <div className="flex gap-2">
      {cities.map(cc => (
        <span 
          key={cc.id}
          className={`px-2 py-1 rounded text-sm ${
            cc.isPrimary 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {cc.cityName} {cc.isPrimary && '⭐'}
        </span>
      ))}
    </div>
  );
}
```

### **Ejemplo 3: Estadísticas de sede**

```tsx
// Mostrar estadísticas de sede compartida
function HeadquarterStats({ headquarterId }: { headquarterId: number }) {
  const [stats, setStats] = useState<{ companyCount: number; totalArea: number } | null>(null);

  useEffect(() => {
    companyService.getHeadquarterStats(headquarterId).then(setStats);
  }, [headquarterId]);

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="stats">
      <div>
        <span>Empresas:</span>
        <strong>{stats.companyCount}</strong>
      </div>
      <div>
        <span>Área Total:</span>
        <strong>{stats.totalArea} m²</strong>
      </div>
    </div>
  );
}
```

---

## 🎨 Estilos y UI

Los componentes usan **Tailwind CSS** y **Heroicons** para un diseño consistente:

- **Colores:**
  - Azul: Acciones principales
  - Amarillo: Ciudad/elemento principal
  - Rojo: Acciones destructivas
  - Gris: Acciones secundarias

- **Iconos:**
  - ⭐ (StarIcon): Ciudad principal
  - ➕ (PlusIcon): Agregar
  - 🗑️ (TrashIcon): Eliminar
  - ✏️ (PencilIcon): Editar
  - ❌ (XMarkIcon): Cerrar

---

## ✅ Validaciones Implementadas

### **Empresa-Ciudad:**
- ❌ No se puede agregar la misma ciudad dos veces
- ❌ No se puede eliminar la única ciudad de una empresa
- ❌ No se puede eliminar la ciudad principal sin asignar otra primero
- ✅ Solo puede haber una ciudad principal por empresa

### **Sede-Empresa:**
- ❌ No se puede agregar la misma empresa dos veces a una sede
- ✅ Los campos piso, oficina y área son opcionales
- ✅ El área debe ser un número positivo

---

## 🚀 Flujo de Trabajo Típico

### **Configurar empresa en múltiples ciudades:**

1. Usuario abre modal "Gestionar Ciudades" desde tabla de empresas
2. Selecciona ciudad del dropdown
3. Marca checkbox "Principal" si es la ciudad matriz
4. Click en "Agregar"
5. La ciudad aparece en la lista con indicador ⭐ si es principal
6. Puede cambiar ciudad principal clickeando en la estrella vacía
7. Puede remover ciudades con el botón de eliminar

### **Configurar sede compartida:**

1. Usuario abre modal "Gestionar Empresas" desde tabla de sedes
2. Selecciona empresa del dropdown
3. Ingresa detalles opcionales: piso, oficina, área
4. Click en "Agregar Empresa"
5. La empresa aparece en la lista con sus detalles
6. Puede editar detalles clickeando en el ícono de lápiz
7. Puede remover empresas con el botón de eliminar

---

## 📝 Notas Importantes

1. **Actualización de datos:** Los modales llaman a `onUpdate()` después de cada operación exitosa para refrescar la vista principal

2. **Manejo de errores:** Todos los errores del backend se muestran en un banner rojo en la parte superior del modal

3. **Loading states:** Los botones se deshabilitan durante operaciones para prevenir clicks múltiples

4. **Confirmaciones:** Las acciones destructivas (eliminar) requieren confirmación del usuario

5. **Compatibilidad:** Los componentes son totalmente responsivos (mobile, tablet, desktop)

---

## 🔄 Migración de Código Existente

Si tienes código que usa la estructura antigua (una ciudad por empresa), necesitas actualizar:

**Antes:**
```tsx
<span>{company.cityName}</span>
```

**Después:**
```tsx
{company.cities?.map(cc => (
  <span key={cc.id}>
    {cc.cityName} {cc.isPrimary && '⭐'}
  </span>
))}
```

---

## 🎯 Próximos Pasos

Para integrar completamente en tu aplicación:

1. ✅ Importar componentes modales en páginas de empresas/sedes
2. ✅ Agregar botones "Gestionar Ciudades" y "Gestionar Empresas"
3. ✅ Actualizar visualización de datos para mostrar múltiples ciudades/empresas
4. ✅ Compilar y probar en desarrollo
5. ✅ Desplegar a producción

---

**¡Los componentes están listos para usar!** Solo necesitas importarlos y agregarlos a tus páginas existentes.

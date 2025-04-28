# Sistema Ermita - React + Vite

Este proyecto es una reimplementación del Sistema Ermita utilizando React con Vite y optimizaciones avanzadas de rendimiento. El sistema está diseñado para la gestión de inventario y mantenimientos.

## Características

- **Diseño Moderno**: Interfaz de usuario moderna con animaciones fluidas y diseño responsive
- **Alto Rendimiento**: Optimizado con Vite para tiempos de carga y compilación rápidos
- **Autenticación**: Sistema de login y recuperación de contraseña con fondo animado compartido
- **Módulos Principales**:
  - Dashboard con información general
  - Gestión de Inventario
  - Control de Mantenimientos
  - Generación de Reportes
  - Historial de actividades
  - Configuración del sistema

## Tecnologías Utilizadas

- **React 19**: Framework de UI moderno y reactivo
- **Vite**: Herramienta de compilación ultrarrápida con optimizaciones avanzadas
- **TailwindCSS 4**: Framework de CSS utilitario para estilos consistentes
- **Framer Motion**: Biblioteca para animaciones fluidas
- **React Router Dom**: Para la navegación entre páginas
- **Chart.js**: Para visualizaciones y gráficos estadísticos

## Estructura del Proyecto

El proyecto está organizado en una estructura clara y modular:

```
src/
├── components/      # Componentes reutilizables
├── layouts/         # Layouts compartidos (AuthLayout, RootLayout)
├── pages/           # Páginas organizadas por secciones
│   ├── auth/        # Páginas de autenticación
│   ├── configuracion/
│   ├── historial/
│   ├── inventario/
│   ├── mantenimientos/
│   └── reportes/
└── assets/          # Recursos estáticos
```

## Características Específicas

### Optimización de Experiencia de Usuario
El sistema implementa un layout compartido para las páginas de autenticación (login y recuperación de contraseña) que mantiene el mismo fondo animado con burbujas para evitar que se recargue al navegar entre estas páginas, mejorando la experiencia del usuario.

### Optimizaciones de Rendimiento
- Configuración avanzada de Vite para optimizar la compilación
- División de código (code splitting) para carga más rápida
- Lazy loading de componentes para mejorar el tiempo de carga inicial

## Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con optimizaciones
- `npm run build`: Compila el proyecto para producción
- `npm run preview`: Previsualiza la compilación de producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Requisitos

- Node.js 20.0 o superior
- npm 10.0 o superior

import { useState, useEffect } from 'react';

type Bubble = {
  id: number;
  size: number;
  color: string;
  animation: string;
  top: string;
  left: string;
  delay: string;
  duration: string;
  opacity: string;
  blur: string;
  transform: string;
};

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Solo aplicar overflow hidden al contenedor, no al body
    setMounted(true);
    
    // Generar burbujas con tonos más claros para mejorar la legibilidad del texto
    setBubbles(Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: 150 + Math.random() * 250,
      // Usar colores más suaves y claros para mejorar el contraste
      color: i % 3 === 0 
        ? '191, 219, 254' // blue-200
        : i % 3 === 1 
          ? '147, 197, 253' // blue-300 
          : '96, 165, 250', // blue-400
      animation: i % 3 === 0 ? 'animate-move-1' : i % 3 === 1 ? 'animate-move-2' : 'animate-move-3',
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${15 + Math.random() * 20}s`,
      opacity: `${0.1 + Math.random() * 0.25}`,
      blur: `${10 + Math.floor(Math.random() * 15)}px`,
      transform: `scale(${0.85 + Math.random() * 0.3})`
    })));
    
    return () => {
      // No hay necesidad de restablecer nada aquí
    };
  }, []);

  return (
    <main className="fixed inset-0 flex items-center justify-center min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient-slow">
          {/* Burbujas que se mueven por toda la pantalla - Solo renderizadas del lado del cliente */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden">
              {bubbles.map(bubble => (
                <div
                  key={`bubble-${bubble.id}`}
                  className={`absolute rounded-full mix-blend-multiply ${bubble.animation}`}
                  style={{
                    backgroundColor: `rgba(${bubble.color}, ${bubble.opacity})`, 
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    top: bubble.top,
                    left: bubble.left,
                    animationDelay: bubble.delay,
                    animationDuration: bubble.duration,
                    filter: `blur(${bubble.blur})`,
                    transform: bubble.transform,
                    willChange: 'transform, opacity',
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="absolute inset-0">
            {[...Array(7)].map((_, i) => (
              <div
                key={`pulse-${i}`}
                className="absolute rounded-full animate-pulse-slow"
                style={{
                  background: `radial-gradient(circle at center, rgba(219, 234, 254, ${0.25 - i * 0.03}) 10%, transparent 70%)`,
                  width: `${300 + i * 80}px`,
                  height: `${300 + i * 80}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${6 + i * 1.5}s`,
                  opacity: 0.7 - i * 0.08,
                  willChange: 'transform, opacity',
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Contenido superpuesto con mejor contraste en el fondo */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-0 transition-all duration-500 ease-out">
        {children}
      </div>
    </main>
  );
}

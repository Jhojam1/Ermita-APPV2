import { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  size: number;
  color: string;
  animation: string;
  top: string;
  left: string;
  delay: string;
}

const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Asegurarse de que los elementos estén posicionados correctamente desde el inicio
    setMounted(true);
    
    // Generar las burbujas con los mismos valores que en el proyecto original
    setBubbles(Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: 150 + Math.random() * 250, // Tamaños entre 150px y 400px igual que el original
      color: i % 3 === 0 
        ? '96, 165, 250' // Blue-300
        : i % 3 === 1 
          ? '59, 130, 246' // Blue-500
          : '37, 99, 235', // Blue-600
      animation: i % 3 === 0 ? 'animate-move-1' : i % 3 === 1 ? 'animate-move-2' : 'animate-move-3',
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      delay: `${Math.random() * 8}s`
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 animate-gradient">
        {/* Burbujas que se mueven por toda la pantalla - Solo renderizadas del lado del cliente */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {bubbles.map(bubble => (
              <div
                key={`bubble-${bubble.id}`}
                className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-60 ${bubble.animation}`}
                style={{
                  backgroundColor: `rgba(${bubble.color}, 0.25)`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  top: bubble.top,
                  left: bubble.left,
                  animationDelay: bubble.delay
                }}
              />
            ))}
          </div>
        )}
        
        {/* Círculos pulsantes estáticos - Exactamente como en el original */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={`pulse-${i}`}
              className="absolute rounded-full animate-pulse-slow"
              style={{
                background: `radial-gradient(circle at center, rgba(${i % 2 ? '96, 165, 250' : '59, 130, 246'}, 0.2) 0%, transparent 70%)`,
                width: `${300 + (i * 30)}px`,
                height: `${300 + (i * 30)}px`,
                top: `${15 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
                animationDelay: `${i * 0.8}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBackground;

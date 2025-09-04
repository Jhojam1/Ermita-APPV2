import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { XMarkIcon, ArrowsPointingOutIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SignaturePadProps {
  value?: string;
  onChange: (signature: string | undefined) => void;
  width?: number;
  height?: number;
  label?: string;
  required?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  width = 500,
  height = 200,
  label = 'Firma Digital',
  required = false,
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const fullScreenSigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(!value);
  const [showFullScreenSignature, setShowFullScreenSignature] = useState(false);

  // Limpiar la firma
  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onChange(undefined);
    }
    if (fullScreenSigCanvas.current) {
      fullScreenSigCanvas.current.clear();
    }
  };

  // Guardar la firma como imagen base64
  const save = () => {
    // Si estamos en modo pantalla completa, usamos ese canvas
    if (showFullScreenSignature && fullScreenSigCanvas.current) {
      if (!fullScreenSigCanvas.current.isEmpty()) {
        const dataURL = fullScreenSigCanvas.current.toDataURL('image/png');
        onChange(dataURL);
        setIsEmpty(false);
      } else {
        onChange(undefined);
        setIsEmpty(true);
      }
    }
    // De lo contrario, usamos el canvas normal
    else if (sigCanvas.current) {
      if (!sigCanvas.current.isEmpty()) {
        const dataURL = sigCanvas.current.toDataURL('image/png');
        onChange(dataURL);
        setIsEmpty(false);
      } else {
        onChange(undefined);
        setIsEmpty(true);
      }
    }
  };
  
  // Abrir el modo de firma a pantalla completa
  const openFullScreenSignature = () => {
    setShowFullScreenSignature(true);
    
    // Si ya hay una firma en el canvas normal, la copiamos al canvas de pantalla completa
    if (value && fullScreenSigCanvas.current) {
      setTimeout(() => {
        load(value, fullScreenSigCanvas.current);
      }, 100);
    }
  };
  
  // Cerrar el modo de firma a pantalla completa y sincronizar
  const closeFullScreenSignature = () => {
    syncSignatureFromFullScreen();
    setShowFullScreenSignature(false);
  };
  
  // Sincronizar la firma desde el canvas de pantalla completa al canvas normal
  const syncSignatureFromFullScreen = () => {
    if (fullScreenSigCanvas.current) {
      if (!fullScreenSigCanvas.current.isEmpty()) {
        const fullScreenSignature = fullScreenSigCanvas.current.toDataURL('image/png');
        onChange(fullScreenSignature);
        setIsEmpty(false);
        
        // Si el canvas normal está disponible, también actualizamos su contenido
        if (sigCanvas.current) {
          sigCanvas.current.clear();
          load(fullScreenSignature, sigCanvas.current);
        }
      }
    }
  };

  // Cargar una firma existente en un canvas específico
  const load = (dataURL: string, canvas?: SignatureCanvas | null) => {
    const targetCanvas = canvas || sigCanvas.current;
    
    if (targetCanvas && dataURL) {
      const image = new Image();
      image.onload = () => {
        const ctx = targetCanvas.getCanvas().getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, targetCanvas.getCanvas().width, targetCanvas.getCanvas().height);
          setIsEmpty(false);
        }
      };
      image.src = dataURL;
    }
  };

  // Cargar firma existente al montar el componente o cuando cambie el valor
  React.useEffect(() => {
    if (value && sigCanvas.current) {
      load(value);
    }
  }, [value]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openFullScreenSignature}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            title="Firmar en pantalla completa"
          >
            <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
            Pantalla completa
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpiar
          </button>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: width,
            height: height,
            className: 'w-full h-full signature-canvas',
          }}
          onEnd={save}
        />
      </div>
      
      {isEmpty && required && (
        <p className="mt-1 text-sm text-red-600">La firma es requerida</p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        Dibuja tu firma en el área de arriba utilizando el ratón o pantalla táctil
      </p>
      
      {/* Modal de firma a pantalla completa */}
      {showFullScreenSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Firma Digital</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clear}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={closeFullScreenSignature}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Confirmar
                </button>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 h-[70vh]">
              <SignatureCanvas
                ref={fullScreenSigCanvas}
                penColor="black"
                canvasProps={{
                  width: 1000,
                  height: 600,
                  className: 'w-full h-full signature-canvas',
                }}
                onEnd={() => save()}
              />
            </div>
            
            <p className="mt-2 text-sm text-gray-500 text-center">
              Dibuja tu firma en el área de arriba. Haz clic en "Confirmar" cuando hayas terminado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;

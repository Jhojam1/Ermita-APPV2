import React from 'react';

interface GradientButtonProps {
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  isLoading = false,
  type = 'button',
  onClick,
  className = '',
  children
}) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      onClick={onClick}
      className={`
        relative w-full py-2 sm:py-3 px-4 rounded-xl text-white overflow-hidden
        ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}
        transition-all duration-300 font-medium group
        hover:shadow-lg hover:shadow-blue-500/30
        ${className}
      `}
    >
      <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-blue-500 to-blue-700 group-hover:skew-x-12"></span>
      <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform skew-x-12 bg-gradient-to-l from-blue-600 to-blue-800 group-hover:-skew-x-12"></span>
      <span className="absolute bottom-0 left-0 hidden w-10 h-20 transition-all duration-100 ease-out transform -translate-x-8 translate-y-10 bg-blue-700 -rotate-12"></span>
      <span className="absolute bottom-0 right-0 hidden w-10 h-20 transition-all duration-100 ease-out transform translate-x-10 translate-y-8 bg-blue-500 -rotate-12"></span>
      <span className="absolute inset-0 w-full h-full animate-shimmer opacity-0 group-hover:opacity-100"></span>
      <span className="relative z-10">
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        ) : children}
      </span>
    </button>
  );
};

export default GradientButton;

import React from 'react';

const CoverSlide = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      {/* Main content */}
      <div className="z-10 flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-10">
          {/* Exact Phenom logo from website */}
          <img 
            src="https://phenom.earth/company/wp-content/uploads/2023/05/cropped-logo_small.png" 
            alt="Phenom Logo" 
            className="w-32 h-32"
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-6xl font-bold mb-6 uppercase tracking-wider">
          PHENOM, THE APP
        </h1>
        
        {/* Tagline */}
        <p className="text-xl font-light tracking-wide text-gray-300 mb-16 max-w-2xl text-center">
          A revolutionary platform that unites individuals with a shared curiosity
          and fascination for unexplained phenomena
        </p>
        
        {/* Phone mockup */}
        <div className="relative mt-6">
          <div className="w-64 h-96 rounded-3xl border-2 border-gray-800 bg-gray-900 overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-10 bg-black"></div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black"></div>
            <div className="h-full flex items-center justify-center">
              <img 
                src="/api/placeholder/200/400" 
                alt="Phenom App Screenshot"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
          </div>
        </div>
        
        {/* Subtitle/Version */}
        <div className="mt-16 opacity-80 text-sm">
          Investor Pitch Deck | 2025
        </div>
      </div>
    </div>
  );
};

export default CoverSlide;

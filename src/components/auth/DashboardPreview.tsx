import { useState } from 'react';

export function DashboardPreview() {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState('/dashboard_preview.png');

  // Try to load image from public folder first, then fallback
  const handleImageError = () => {
    if (imageSrc === '/dashboard_preview.png') {
      // Try alternative path or show placeholder
      setImageError(true);
    } else {
      setImageError(true);
    }
  };

  return (
    <div className="relative h-full w-full flex items-center justify-center p-4 lg:p-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl h-full flex flex-col justify-center">
        {/* Headline */}
        <div className="mb-6 lg:mb-8 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3">
            Effortlessly manage your team and operations.
          </h1>
          <p className="text-base lg:text-lg xl:text-xl text-white/90">
            Log in to access your CRM dashboard and manage your team.
          </p>
        </div>

        {/* Dashboard Image or Placeholder */}
        <div className="relative transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
          {!imageError ? (
            <img 
              src={imageSrc} 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-xl lg:rounded-2xl shadow-2xl object-contain max-h-[calc(100vh-220px)]"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-[500px] bg-white/10 rounded-xl lg:rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20">
              <div className="text-center text-white/70 px-8">
                <p className="text-xl mb-3 font-semibold">Dashboard Preview</p>
                <p className="text-base mb-4">Image not found</p>
                <div className="text-sm space-y-2 text-left bg-white/5 p-4 rounded-lg">
                  <p className="font-semibold mb-2">To fix this:</p>
                  <p>1. Create a <code className="bg-white/10 px-2 py-1 rounded text-xs">public</code> folder at the root</p>
                  <p>2. Copy <code className="bg-white/10 px-2 py-1 rounded text-xs">src/assets/dashboard_preview.png</code></p>
                  <p>3. Paste it to <code className="bg-white/10 px-2 py-1 rounded text-xs">public/dashboard_preview.png</code></p>
                  <p className="text-xs mt-3 text-white/60">Or restart your dev server if you just added the file</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

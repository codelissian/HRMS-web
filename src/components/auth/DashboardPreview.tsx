import { useState, useEffect } from 'react';

export function DashboardPreview() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import the image to avoid build errors if it doesn't exist
    const loadImage = async () => {
      try {
        // Use dynamic import - this won't break the build if file doesn't exist
        const imageModule = await import(
          /* @vite-ignore */
          '@/assets/dashboard_preview.png'
        );
        setImageSrc(imageModule.default);
        setImageLoaded(true);
      } catch (error) {
        // Image not found - will show placeholder
        console.warn('Dashboard preview image not found:', error);
        setImageLoaded(true);
      }
    };
    loadImage();
  }, []);

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
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-xl lg:rounded-2xl shadow-2xl object-contain max-h-[calc(100vh-220px)]"
              onError={() => setImageSrc(null)}
            />
          ) : imageLoaded ? (
            <div className="w-full h-[500px] bg-white/10 rounded-xl lg:rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20">
              <div className="text-center text-white/70 px-8">
                <p className="text-xl mb-3 font-semibold">Dashboard Preview</p>
                <p className="text-base mb-2">Image not found</p>
                <p className="text-sm">Add <code className="bg-white/10 px-2 py-1 rounded">dashboard_preview.png</code> to <code className="bg-white/10 px-2 py-1 rounded">src/assets/</code></p>
              </div>
            </div>
          ) : (
            <div className="w-full h-[500px] bg-white/10 rounded-xl lg:rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-white/70">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

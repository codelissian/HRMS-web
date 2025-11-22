// Import the dashboard image
import dashboardImage from '@/assets/dashboard-preview.png';

export function DashboardPreview() {
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

        {/* Dashboard Image */}
        <div className="relative transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
          <img 
            src={dashboardImage} 
            alt="Dashboard Preview" 
            className="w-full h-auto rounded-xl lg:rounded-2xl shadow-2xl object-contain max-h-[calc(100vh-220px)]"
          />
        </div>
      </div>
    </div>
  );
}

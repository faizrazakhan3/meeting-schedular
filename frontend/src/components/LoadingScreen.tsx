import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-app-bg flex flex-col items-center justify-center font-primary">
      <div className="flex flex-col items-center gap-4">
        {/* Sleek dynamic spinner */}
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-[#ECE8E1] border-t-primary animate-spin"></div>
        </div>
        <div className="text-center mt-2 animate-pulse">
          <h2 className="text-xl font-semibold text-[#2D2D2D]">Loading...</h2>
          <p className="text-sm text-[#8B8B8B] mt-1">Preparing your workspace</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

import React, { useState, useEffect } from 'react';
import { Clock, Users, Shield, Heart, ChevronLeft, ChevronRight, Award, MessageCircle, Zap } from 'lucide-react';
import { LoginForm } from '../Auth/LoginForm';
import { RegisterForm } from '../Auth/RegisterForm';

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, username: string) => Promise<void>;
  onLoginWithGoogle: () => Promise<void>;
  onLoginWithPhone: (phone: string) => Promise<void>;
  onToggleMode: () => void;
  authMode: 'login' | 'register';
  loading: boolean;
  error: string;
}

const carouselItems = [
  {
    icon: Clock,
    text: "Exchange time, not money.",
    description: "Trade your skills for time credits and access services from others in your community.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    iconBg: "bg-gradient-to-br from-purple-100 to-pink-100"
  },
  {
    icon: Users,
    text: "Offer your skills and earn time credits.",
    description: "Share your expertise and build a network of trusted service providers.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100"
  },
  {
    icon: Shield,
    text: "Build trust and grow your reputation.",
    description: "Earn reviews and ratings that showcase your reliability and expertise.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100"
  },
  {
    icon: Heart,
    text: "A smarter way to connect and help each other.",
    description: "Create meaningful connections while contributing to your community.",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
    iconBg: "bg-gradient-to-br from-orange-100 to-red-100"
  },
  {
    icon: Award,
    text: "Level up your skills and earn rewards.",
    description: "Complete services to gain experience points and unlock new opportunities.",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-gradient-to-br from-indigo-50 to-purple-50",
    iconBg: "bg-gradient-to-br from-indigo-100 to-purple-100"
  },
  {
    icon: MessageCircle,
    text: "Connect and communicate seamlessly.",
    description: "Chat with service providers and requesters in real-time with secure messaging.",
    color: "from-teal-500 to-green-500",
    bgColor: "bg-gradient-to-br from-teal-50 to-green-50",
    iconBg: "bg-gradient-to-br from-teal-100 to-green-100"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  onLoginWithGoogle,
  onLoginWithPhone,
  onToggleMode,
  authMode,
  loading,
  error
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance carousel with smooth infinite scrolling
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000); // Increased to 5 seconds for better UX

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
      setIsTransitioning(false);
    }, 300);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume auto-play after 8s
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
      setIsTransitioning(false);
    }, 300);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume auto-play after 8s
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume auto-play after 8s
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </h1>
              <p className="text-sm text-gray-600 font-medium">Where Time Meets Talent</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 py-8">
        {/* Carousel Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Carousel Container */}
            <div className={`relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 ${carouselItems[currentSlide].bgColor}`}>
              <div className="relative h-[500px]">
                {carouselItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === currentSlide;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ease-in-out ${
                        isActive
                          ? 'opacity-100 translate-x-0 scale-100'
                          : index < currentSlide
                          ? 'opacity-0 -translate-x-full scale-95'
                          : 'opacity-0 translate-x-full scale-95'
                      }`}
                    >
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-500"></div>
                      </div>
                      
                      {/* Icon with enhanced styling */}
                      <div className={`w-28 h-28 bg-gradient-to-r ${item.color} rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform transition-all duration-500 ${
                        isActive ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                      }`}>
                        <Icon className="w-14 h-14 text-white drop-shadow-lg" />
                      </div>
                      
                      {/* Content with better typography */}
                      <h2 className="text-4xl font-bold text-gray-900 text-center mb-6 leading-tight transform transition-all duration-500 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }">
                        {item.text}
                      </h2>
                      <p className="text-gray-700 text-center leading-relaxed text-lg max-w-sm transform transition-all duration-700 delay-200 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Navigation Dots */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all duration-500 hover:scale-125 ${
                      index === currentSlide
                        ? 'bg-white w-10 h-3 shadow-lg'
                        : 'bg-white/60 w-3 h-3 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>

              {/* Enhanced Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-8 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl backdrop-blur-sm"
              >
                <ChevronLeft className="w-7 h-7 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl backdrop-blur-sm"
              >
                <ChevronRight className="w-7 h-7 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Login/Register Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-100/50 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100/30 to-teal-100/30 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* Form content */}
              <div className="relative z-10">
                {authMode === 'login' ? (
                  <LoginForm onToggleMode={onToggleMode} />
                ) : (
                  <RegisterForm onToggleMode={onToggleMode} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-400">
            © TimeBank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

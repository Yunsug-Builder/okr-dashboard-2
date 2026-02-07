import React from 'react';
import { LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  loading: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Objectives Dashboard</h1>
      <p className="text-gray-600 mb-8 text-center">Please sign in to manage your objectives.</p>
      <button 
        onClick={onLogin} 
        className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
      >
        <LogIn size={20} className="mr-2" /> Sign in with Google
      </button>
    </div>
  );
};

export default Auth;

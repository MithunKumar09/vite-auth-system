// frontend/screens/SignUp.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../constants/axiosInstance';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../storage/authStore';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
    const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: '', email: '', password: '', confirmPassword: '' };

    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long.';
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/signup', { username, email, password });

      if (response.status === 201) {
        alert('Account created! Please log in.');
        navigate('/signin');
      } else {
        alert(response.data.message || 'Something went wrong');
      }
    } catch (error: any) {
      if (error.response) {
        alert(error.response.data.message || 'Server error');
      } else if (error.request) {
        alert('Network error. Please check your connection.');
      } else {
        alert('Unexpected error occurred.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type={passwordVisible ? 'text' : 'password'}
            className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-10 cursor-pointer text-gray-500"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? '🙈' : '👁️'}
          </span>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type={confirmPasswordVisible ? 'text' : 'password'}
            className="mt-1 w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-10 cursor-pointer text-gray-500"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            {confirmPasswordVisible ? '🙈' : '👁️'}
          </span>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <span
            className="text-indigo-600 hover:underline cursor-pointer"
            onClick={() => navigate('/signin')}
          >
            Log in
          </span>
        </p>
                <div className="mt-6 flex items-center justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const response = await api.post('/auth/google', {
                  credential: credentialResponse.credential,
                }, { withCredentials: true });

                if (response.data.success) {
                  setAuthStatus(true, {
                    username: response.data.username,
                    email: response.data.email,
                  });
                  alert('Google Login Successful');
                  navigate('/home');
                } else {
                  alert('Google login failed');
                }
              } catch (error) {
                console.error('Google login error:', error);
                alert('Error logging in with Google');
              }
            }}
            onError={() => {
              alert('Google Login Failed');
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;

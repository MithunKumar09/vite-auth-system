// frontend/screens/SignIn.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Vite + React Router
import { useAuthStore } from '../storage/authStore';
import api from '../constants/axiosInstance';
import { GoogleLogin } from '@react-oauth/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post(
        '/auth/login',
        { email, password },
        { withCredentials: true } // Important!
      );

      if (response.data.success) {
        setAuthStatus(true, {
          username: response.data.username,
          email: response.data.email,
        });
        alert('Login Successful');
        navigate('/home');
      } else {
        alert(`Login Failed: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error?.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '1035881482072205',
        cookie: true,
        xfbml: true,
        version: 'v20.0',
      });
    };

    // Load Facebook SDK dynamically
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs?.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}

          <div className="mt-2 text-right">
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-indigo-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Sign In
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/signup')}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Sign Up
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
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => {
              window.FB.login(function (response: any) {
                if (response.authResponse) {
                  const { accessToken, userID } = response.authResponse;
                  api.post('/auth/facebook', { accessToken, userID }, { withCredentials: true })
                    .then((res) => {
                      if (res.data.success) {
                        setAuthStatus(true, {
                          username: res.data.username,
                          email: res.data.email,
                        });
                        alert('Facebook Login Successful');
                        navigate('/home');
                      } else {
                        alert('Facebook login failed');
                      }
                    })
                    .catch(() => alert('Facebook login error'));
                } else {
                  alert('User cancelled login or did not fully authorize.');
                }
              }, { scope: 'email,public_profile', auth_type: 'rerequest' });
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            <FontAwesomeIcon icon={faFacebookF} className="text-white text-lg" />
            Continue with Facebook
          </button>
        </div>


      </div>
    </div>
  );
};

export default SignIn;

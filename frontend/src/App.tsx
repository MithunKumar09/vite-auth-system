// src/App.tsx
import { useEffect } from 'react';
import { useAuthStore } from './storage/authStore';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Home from './components/Home';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { isLoading, checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth(); // 🔁 Run once on mount
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={isAuthenticated ? <Navigate to="/home" /> : <SignIn />} />
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/signin" />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/signin"} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;


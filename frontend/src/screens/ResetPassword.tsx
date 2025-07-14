// frontend/screens/ResetPassword.tsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../constants/axiosInstance';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email')!;
  const token = searchParams.get('token')!;
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      setMessage('Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        <input
          type="password"
          className="border px-4 py-2 w-full rounded"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded w-full"
        >
          Reset Password
        </button>
        {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;

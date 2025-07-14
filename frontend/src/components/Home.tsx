import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../storage/authStore';

function Home() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const username = useAuthStore((state) => state.username);

  const handleSignOut = () => {
    logout(); // Clear tokens and state

    // ✅ Confirm everything is cleared
    setTimeout(() => {
      console.log('✅ After logout:');
      console.log('token:', localStorage.getItem('token'));
      console.log('refreshToken:', localStorage.getItem('refreshToken'));
      console.log('username:', localStorage.getItem('username'));
      console.log('email:', localStorage.getItem('email'));
    }, 500); // Delay to ensure async `localStorage` is updated

    navigate('/signin'); // Redirect to sign-in
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-md p-6 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {username || 'User'} 👋</h1>
        <p className="text-gray-600 mb-8">You are now logged in. Explore your dashboard!</p>

        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Home;

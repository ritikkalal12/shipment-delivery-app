import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaShippingFast, FaGoogle } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed.');
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Enter your email to reset password.');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset link sent to your email.');
    } catch (err) {
      setError('Failed to send reset email.');
    }
  };

  return (
    <div className='bg-[#BDDDFC] min-h-screen flex flex-col justify-between font-sans'>
      {/* Header */}
      <header className='bg-[#384959] shadow-md sticky top-0 z-50 w-full'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2'>
            <FaShippingFast className='text-[#88BDF2] text-3xl' /> DakiyaXpress
          </h1>
          <div className='flex items-center gap-4 text-sm md:text-base'>
            <Link
              to='/'
              className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#2F3A44] transition-colors'
            >
              Home
            </Link>
            <Link
              to='/register'
              className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#2F3A44] transition-colors'
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className='flex-grow flex items-center justify-center px-4 py-12'>
        <div className='max-w-md w-full bg-white p-8 rounded-lg shadow-lg'>
          <h2 className='text-center text-3xl font-bold text-[#384959] mb-6'>
            Login/SignIn
          </h2>
          <form onSubmit={handleLogin} className='space-y-4'>
            <input
              type='email'
              placeholder='Email'
              className='w-full border border-[#88BDF2] p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88BDF2]'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type='password'
              placeholder='Password'
              className='w-full border border-[#88BDF2] p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#88BDF2]'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <div className='text-right text-sm'>
              <button
                type='button'
                onClick={handleResetPassword}
                className='text-[#384959] hover:underline'
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className='text-red-600 text-sm text-center'>{error}</p>
            )}

            <button
              type='submit'
              className='w-full bg-[#384959] text-white py-3 rounded-md font-semibold hover:bg-[#2F3A44] transition'
            >
              Login
            </button>
          </form>

          <div className='text-center my-4 text-sm text-[#6A89A7]'>or</div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-2 bg-white border border-[#88BDF2] text-[#384959] py-3 rounded-md font-medium hover:bg-[#f0f8ff] transition'
          >
            <FaGoogle /> Login with Google
          </button>

          {/* Signup Link */}
          <p className='text-center text-sm mt-6 text-[#6A89A7]'>
            Don’t have an account?{' '}
            <Link
              to='/register'
              className='text-[#384959] font-semibold hover:underline'
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-[#384959] text-white py-6'>
        <div className='max-w-6xl mx-auto text-center text-sm'>
          &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

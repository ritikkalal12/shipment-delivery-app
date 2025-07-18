import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FaShippingFast } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [error, setError] = useState('');

  const navigate = useNavigate(); // for redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const {
      email,
      password,
      fullName,
      phone,
      street,
      city,
      state,
      zip,
      country,
    } = formData;
    if (
      !email ||
      !password ||
      !fullName ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !zip ||
      !country
    )
      return 'All fields are required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    if (phone.length < 10) return 'Phone number must be at least 10 digits';
    if (zip.length < 4) return 'ZIP code must be at least 4 digits';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const {
        email,
        password,
        fullName,
        phone,
        street,
        city,
        state,
        zip,
        country,
      } = formData;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        fullName,
        phone,
        address: { street, city, state, zip, country },
        role: 'user',
        createdAt: serverTimestamp(),
      });

      navigate('/dashboard'); // 🔁 Redirect after successful registration
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen bg-[#BDDDFC] font-sans'>
      {/* Header */}
      <header className='bg-[#384959] shadow-md sticky top-0 z-50 w-full'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2'>
            <FaShippingFast className='text-[#88BDF2] text-3xl' /> DakiyaXpress
          </h1>
          <div className='flex gap-4 text-sm md:text-base'>
            <Link
              to='/'
              className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#384959] transition-colors'
            >
              Home
            </Link>
            <Link
              to='/login'
              className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#384959] transition-colors'
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <div className='flex items-center justify-center px-4 py-10'>
        <div className='w-full max-w-2xl bg-white p-8 rounded-lg shadow-md'>
          <h2 className='text-3xl font-bold text-center text-[#384959] mb-6'>
            Register/SignUp
          </h2>
          <form onSubmit={handleRegister} className='flex flex-col space-y-4'>
            {[
              { name: 'fullName', placeholder: 'Full Name' },
              { name: 'phone', placeholder: 'Phone Number', type: 'tel' },
              { name: 'email', placeholder: 'Email', type: 'email' },
              { name: 'password', placeholder: 'Password', type: 'password' },
              { name: 'street', placeholder: 'Street Address' },
              { name: 'city', placeholder: 'City' },
              { name: 'state', placeholder: 'State/Province' },
              { name: 'zip', placeholder: 'ZIP/Postal Code' },
              { name: 'country', placeholder: 'Country' },
            ].map(({ name, placeholder, type = 'text' }) => (
              <input
                key={name}
                name={name}
                placeholder={placeholder}
                type={type}
                className='border border-[#88BDF2] p-3 rounded-md focus:ring-2 focus:ring-[#88BDF2]'
                value={formData[name]}
                onChange={handleChange}
                required
              />
            ))}

            {error && (
              <p className='text-red-600 text-sm text-center'>{error}</p>
            )}

            <button
              type='submit'
              className='bg-[#384959] text-white py-3 rounded-md font-medium hover:bg-[#2F3A44] transition-colors'
            >
              Register
            </button>
          </form>

          {/* Login instead */}
          <p className='text-center text-sm text-[#6A89A7] mt-4'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-[#384959] font-semibold hover:underline'
            >
              Login instead
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className='bg-[#384959] text-white py-6 mt-10'>
        <div className='max-w-6xl mx-auto text-center text-sm'>
          &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

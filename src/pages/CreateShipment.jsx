import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt, FaShippingFast } from 'react-icons/fa';

const CreateShipment = () => {
  const [shipment, setShipment] = useState({
    senderName: '',
    senderAddress: '',
    senderEmail: '',
    senderPhone: '',
    senderPincode: '',
    receiverName: '',
    receiverAddress: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverPincode: '',
    packageSize: '',
    weight: '',
    deliverySpeed: '',
  });

  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [price, setPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      } else {
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef)
          .then((userSnap) => {
            if (userSnap.exists()) {
              const role = userSnap.data().role || 'user';
              setUserRole(role);
              if (role === 'admin') navigate('/');
            } else {
              setUserRole('user');
            }
          })
          .catch((err) => {
            console.error('Error fetching user role:', err);
            setUserRole('user');
          });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const { packageSize, weight, deliverySpeed } = shipment;
    if (!packageSize || !weight || !deliverySpeed) {
      setPrice(0);
      return;
    }

    const basePrice = 50;
    const weightRate = 20;
    const sizeMultiplier =
      packageSize === 'Small' ? 1 : packageSize === 'Medium' ? 1.5 : 2;
    const speedMultiplier = deliverySpeed === 'Standard' ? 1 : 1.5;

    const calculatedPrice =
      (basePrice + parseFloat(weight) * weightRate) *
      sizeMultiplier *
      speedMultiplier;

    setPrice(Math.round(calculatedPrice));
  }, [shipment.packageSize, shipment.weight, shipment.deliverySpeed]);

  const handleChange = (e) => {
    setShipment({ ...shipment, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;

    if (
      !emailRegex.test(shipment.senderEmail) ||
      !emailRegex.test(shipment.receiverEmail)
    ) {
      alert('Please enter valid email addresses.');
      return false;
    }

    if (
      !phoneRegex.test(shipment.senderPhone) ||
      !phoneRegex.test(shipment.receiverPhone)
    ) {
      alert('Please enter 10-digit phone numbers.');
      return false;
    }

    if (
      !pincodeRegex.test(shipment.senderPincode) ||
      !pincodeRegex.test(shipment.receiverPincode)
    ) {
      alert('Please enter valid 6-digit pincodes.');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    const options = {
      key: 'rzp_test_YcAytgNYjWoCt5',
      amount: price * 100, // in paise
      currency: 'INR',
      name: 'DakiyaXpress',
      description: 'Shipment Payment',
      handler: function (response) {
        alert('✅ Payment Successful!');
        handleFirestoreSubmit();
      },
      prefill: {
        name: shipment.senderName,
        email: shipment.senderEmail,
        contact: shipment.senderPhone,
      },
      theme: {
        color: '#384959',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleFirestoreSubmit = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'shipments'), {
        sender: {
          name: shipment.senderName,
          address: shipment.senderAddress,
          email: shipment.senderEmail,
          phone: shipment.senderPhone,
          pincode: shipment.senderPincode,
        },
        receiver: {
          name: shipment.receiverName,
          address: shipment.receiverAddress,
          email: shipment.receiverEmail,
          phone: shipment.receiverPhone,
          pincode: shipment.receiverPincode,
        },
        package: {
          size: shipment.packageSize,
          weight: shipment.weight,
          deliverySpeed: shipment.deliverySpeed,
        },
        price,
        status: 'Pending',
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      navigate(`/shipment-success/${docRef.id}`);
    } catch (err) {
      console.error('Error adding shipment: ', err);
      alert('❌ Failed to create shipment. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let key in shipment) {
      if (!shipment[key]) {
        alert('Please fill in all fields.');
        return;
      }
    }

    if (!validateInputs()) return;

    handlePayment(); // call Razorpay before submitting to Firestore
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (userRole === null) {
    return (
      <div className='min-h-screen flex items-center justify-center text-[#384959]'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#EAF4FC] font-sans text-[#384959]'>
      {/* Header */}
      <header className='bg-[#384959] text-white px-6 py-4 shadow flex justify-between items-center flex-wrap gap-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#88BDF2] text-[#384959] p-2 rounded-full shadow-md'>
            <FaShippingFast className='text-xl' />
          </div>
          <h1 className='text-xl sm:text-2xl font-extrabold tracking-wider text-white'>
            DakiyaXpress
          </h1>
        </div>
        <div className='flex items-center gap-4 text-sm md:text-base'>
          <button
            onClick={() => navigate('/dashboard')}
            className='bg-[#6A89A7] text-white px-4 py-2 rounded hover:bg-[#2F3A44] transition-colors'
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 bg-red-600 px-4 py-2 text-sm rounded hover:bg-red-700 transition'
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Form */}
      <main className='p-6 max-w-2xl mx-auto bg-white mt-10 rounded-xl shadow-md'>
        <h2 className='text-xl font-bold mb-4 text-center'>
          📦 Create Shipment
        </h2>
        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-1 md:grid-cols-2 gap-4'
        >
          <h3 className='col-span-full font-semibold text-gray-600'>
            Sender Details
          </h3>
          <input
            name='senderName'
            placeholder='Name'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='senderAddress'
            placeholder='Address'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='senderEmail'
            placeholder='Email'
            type='email'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='senderPhone'
            placeholder='Phone Number'
            type='tel'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='senderPincode'
            placeholder='Pincode'
            onChange={handleChange}
            className='border p-2 rounded'
          />

          <h3 className='col-span-full font-semibold text-gray-600 mt-4'>
            Receiver Details
          </h3>
          <input
            name='receiverName'
            placeholder='Name'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='receiverAddress'
            placeholder='Address'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='receiverEmail'
            placeholder='Email'
            type='email'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='receiverPhone'
            placeholder='Phone Number'
            type='tel'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <input
            name='receiverPincode'
            placeholder='Pincode'
            onChange={handleChange}
            className='border p-2 rounded'
          />

          <h3 className='col-span-full font-semibold text-gray-600 mt-4'>
            Package Details
          </h3>
          <select
            name='packageSize'
            onChange={handleChange}
            className='border p-2 rounded'
          >
            <option value=''>Select Package Size</option>
            <option value='Small'>Small</option>
            <option value='Medium'>Medium</option>
            <option value='Large'>Large</option>
          </select>
          <input
            name='weight'
            placeholder='Weight (kg)'
            type='number'
            min='0.1'
            step='0.1'
            onChange={handleChange}
            className='border p-2 rounded'
          />
          <select
            name='deliverySpeed'
            onChange={handleChange}
            className='border p-2 rounded'
          >
            <option value=''>Select Delivery Speed</option>
            <option value='Standard'>Standard</option>
            <option value='Express'>Express</option>
          </select>

          <div className='col-span-full text-center text-lg font-semibold text-green-700'>
            Estimated Price: ₹{price || '--'}
          </div>

          <button
            type='submit'
            disabled={loading}
            className='col-span-full bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 transition'
          >
            {loading ? 'Creating...' : 'Pay & Create Shipment'}
          </button>
        </form>
      </main>

      <footer className='bg-[#384959] text-white text-center text-sm py-4'>
        &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
      </footer>
    </div>
  );
};

export default CreateShipment;

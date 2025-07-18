import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import {
  FaArrowLeft,
  FaPrint,
  FaCheckCircle,
  FaShippingFast,
  FaSignOutAlt,
  FaCopy,
} from 'react-icons/fa';
import html2pdf from 'html2pdf.js';

const ShipmentSuccess = () => {
  const { trackingId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const printRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const docRef = doc(db, 'shipments', trackingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShipment({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Shipment not found.');
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching shipment:', err);
        alert('Something went wrong.');
        navigate('/dashboard');
      }
      setLoading(false);
    };

    fetchShipment();
  }, [trackingId, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: 0.5,
      filename: `Shipment_Receipt_${trackingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex justify-center items-center bg-[#EAF4FC]'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#EAF4FC] to-white font-sans text-[#384959]'>
      <header className='bg-[#384959] text-white px-6 py-4 shadow-md flex justify-between items-center flex-wrap gap-4 sticky top-0 z-50'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#88BDF2] text-[#384959] p-2 rounded-full shadow-md'>
            <FaShippingFast className='text-xl' />
          </div>
          <h1 className='text-xl sm:text-2xl font-extrabold tracking-wide text-white'>
            DakiyaXpress
          </h1>
        </div>
        <div className='flex gap-3'>
          <Link
            to='/dashboard'
            className='flex items-center gap-2 bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 transition'
          >
            <FaArrowLeft /> Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700 transition'
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <main className='max-w-3xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg animate-fade-in'>
        <div className='text-center'>
          <FaCheckCircle className='text-green-500 text-5xl mx-auto mb-3 animate-bounce' />
          <h2 className='text-2xl font-bold'>Shipment Created Successfully!</h2>
          <p className='mt-2 text-gray-600 text-sm'>Tracking ID:</p>
          <div className='flex items-center justify-center gap-2 mt-2'>
            <span className='text-xl font-mono text-blue-600 font-semibold'>
              {trackingId}
            </span>
            <button
              onClick={handleCopy}
              className='text-sm px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition'
            >
              <FaCopy />
            </button>
            {copied && <span className='text-green-600 text-sm'>Copied!</span>}
          </div>

          <div className='mt-6 flex justify-center gap-4'>
            <button
              onClick={handleDownloadPDF}
              className='bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition flex items-center gap-2 shadow'
            >
              <FaPrint /> Download PDF
            </button>
          </div>
        </div>

        <div ref={printRef} className='mt-10 text-sm'>
          <div className='rounded-lg border border-gray-200 overflow-hidden'>
            <Section
              title='📤 Sender Details'
              data={shipment.sender}
              order={['name', 'address', 'email', 'phone', 'pincode']}
            />
            <Section
              title='📥 Receiver Details'
              data={shipment.receiver}
              order={['name', 'address', 'email', 'phone', 'pincode']}
            />
            <Section
              title='📦 Package Details'
              data={{
                size: shipment.package?.size,
                weight: `${shipment.package?.weight} kg`,
                deliverySpeed: shipment.package?.deliverySpeed,
              }}
              order={['size', 'weight', 'deliverySpeed']}
            />
            <Section
              title='🚚 Shipment Info'
              data={{
                status: shipment.status,
                price: `₹${shipment.price}`,
                trackingId,
              }}
              order={['status', 'price', 'trackingId']}
            />
          </div>
        </div>
      </main>

      <footer className='bg-[#384959] text-white text-center text-sm py-4 mt-10'>
        &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
      </footer>
    </div>
  );
};

const Section = ({ title, data, order }) => (
  <div className='border-b border-gray-200'>
    <div className='bg-[#F0F7FF] px-4 py-2 text-[#2D4059] font-semibold text-sm tracking-wide uppercase'>
      {title}
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-4'>
      {order.map((key) => (
        <div key={key} className='flex flex-col'>
          <span className='text-xs text-gray-500 font-medium'>
            {formatLabel(key)}
          </span>
          <span className='text-sm font-semibold'>{data?.[key] || '-'}</span>
        </div>
      ))}
    </div>
  </div>
);

const formatLabel = (label) => {
  return label
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace('Id', 'ID');
};

export default ShipmentSuccess;

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaShippingFast, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { format } from 'date-fns';

const MyShipments = ({ user }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'shipments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShipments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center text-[#384959]'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-[#EAF4FC] font-sans text-[#384959]'>
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

      {/* Main Content */}
      <main className='flex-grow max-w-7xl mx-auto py-10 px-6 w-full'>
        <h2 className='text-3xl font-bold mb-8 text-center'>📦 My Shipments</h2>

        {shipments.length === 0 ? (
          <div className='bg-white p-6 rounded-lg shadow text-center text-gray-600'>
            You have no shipments yet.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white shadow-md rounded-lg overflow-hidden'>
              <thead className='bg-[#88BDF2] text-[#384959] text-sm uppercase font-semibold'>
                <tr>
                  <th className='px-6 py-4 text-left'>Date</th>
                  <th className='px-6 py-4 text-left'>Sender</th>
                  <th className='px-6 py-4 text-left'>Receiver</th>
                  <th className='px-6 py-4 text-left'>Address</th>
                  <th className='px-6 py-4 text-left'>Size</th>
                  <th className='px-6 py-4 text-left'>Status</th>
                </tr>
              </thead>
              <tbody>
                {shipments
                  .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                  .map((ship) => (
                    <tr
                      key={ship.id}
                      onClick={() => navigate(`/shipment/${ship.id}`)}
                      className='border-t hover:bg-[#dceefe] transition cursor-pointer'
                    >
                      <td className='px-6 py-4 text-sm'>
                        {ship.createdAt
                          ? format(
                              new Date(ship.createdAt.seconds * 1000),
                              'dd MMM yyyy'
                            )
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {ship.sender?.name || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {ship.receiver?.name || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {ship.receiver?.address || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        {ship.package?.size || 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ship.status === 'Delivered'
                              ? 'bg-green-100 text-green-700'
                              : ship.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-700'
                              : ship.status === 'Order Picked'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {ship.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='bg-[#384959] text-white text-center text-sm py-4 mt-auto'>
        &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
      </footer>
    </div>
  );
};

export default MyShipments;

import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  FaShippingFast,
  FaSignOutAlt,
  FaUserShield,
  FaShippingFast as FaShipment,
  FaClipboardList,
  FaChartBar,
  FaBoxOpen,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

export default function Dashboard({ user }) {
  const [role, setRole] = useState('');
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        let roleFetched = 'user';
        if (docSnap.exists()) {
          roleFetched = docSnap.data().role || 'user';
          setRole(roleFetched);
        }

        const q =
          roleFetched === 'admin'
            ? query(collection(db, 'shipments'))
            : query(
                collection(db, 'shipments'),
                where('userId', '==', user.uid)
              );

        const unsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setShipments(data);
          setFilteredShipments(data);
        });

        return () => unsub();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  const statusCount = shipments.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Order Picked', value: statusCount['Order Picked'] || 0 },
    { name: 'In Transit', value: statusCount['In Transit'] || 0 },
    { name: 'Delivered', value: statusCount['Delivered'] || 0 },
    { name: 'Failed', value: statusCount['Failed'] || 0 },
  ];

  const handleStatusFilter = (status) => {
    if (status === 'All') {
      setFilteredShipments([...shipments]);
    } else {
      const filtered = shipments.filter((s) => s.status === status);
      setFilteredShipments(filtered);
    }
  };

  return (
    <div className='min-h-screen w-full bg-[#EAF4FC] font-sans text-[#384959]'>
      <header className='bg-[#384959] text-white px-6 py-4 shadow flex justify-between items-center flex-wrap gap-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#88BDF2] text-[#384959] p-2 rounded-full shadow-md'>
            <FaShippingFast className='text-xl' />
          </div>
          <h1 className='text-xl sm:text-2xl font-extrabold tracking-wider text-white'>
            DakiyaXpress
          </h1>
        </div>
        <div className='flex justify-end'>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 bg-red-600 px-4 py-2 text-sm rounded hover:bg-red-700 transition'
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className='bg-[#EAF4FC] py-6 text-center shadow-sm border-b animate-fade-in'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#384959] tracking-wide'>
          Dashboard
        </h2>
        <p className='text-[#6A89A7] text-sm sm:text-base mt-1'>
          Welcome back{user?.fullname ? `, ${user.fullname}` : ''} 👋
        </p>
      </div>

      <main className='px-6 py-10 max-w-7xl mx-auto'>
        <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          {role === 'admin' ? (
            <Link
              to='/admin'
              className='bg-white shadow hover:shadow-lg rounded-lg p-6 text-center hover:bg-[#f0f8ff] transition'
            >
              <FaUserShield className='text-3xl text-[#384959] mx-auto mb-2' />
              <h4 className='text-lg font-semibold'>Admin Panel</h4>
            </Link>
          ) : (
            <>
              <Link
                to='/create-shipment'
                className='bg-white shadow hover:shadow-lg rounded-lg p-6 text-center hover:bg-[#f0f8ff] transition'
              >
                <FaShipment className='text-3xl text-[#384959] mx-auto mb-2' />
                <h4 className='text-lg font-semibold'>Create Shipment</h4>
              </Link>
              <Link
                to='/my-shipments'
                className='bg-white shadow hover:shadow-lg rounded-lg p-6 text-center hover:bg-[#f0f8ff] transition'
              >
                <FaClipboardList className='text-3xl text-[#384959] mx-auto mb-2' />
                <h4 className='text-lg font-semibold'>Track My Shipments</h4>
              </Link>
            </>
          )}
        </section>

        <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12'>
          {[
            {
              icon: <FaShipment />,
              label: 'Total Shipments',
              value: shipments.length,
              color: 'bg-[#88BDF2]',
            },
            {
              icon: <FaChartBar />,
              label: 'Order Picked',
              value: statusCount['Order Picked'] || 0,
              color: 'bg-yellow-400',
            },
            {
              icon: <FaClipboardList />,
              label: 'Delivered',
              value: statusCount['Delivered'] || 0,
              color: 'bg-green-500',
            },
            {
              icon: <FaChartBar />,
              label: 'In Transit',
              value: statusCount['In Transit'] || 0,
              color: 'bg-blue-500',
            },
            {
              icon: <FaBoxOpen />,
              label: 'Failed',
              value: statusCount['Failed'] || 0,
              color: 'bg-red-500',
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`rounded-lg shadow p-6 text-white ${card.color} flex items-center gap-4`}
            >
              <div className='text-3xl'>{card.icon}</div>
              <div>
                <p className='text-sm'>{card.label}</p>
                <h3 className='text-2xl font-bold'>{card.value}</h3>
              </div>
            </div>
          ))}
        </section>

        <section className='bg-white p-6 mb-12 rounded-lg shadow'>
          <h3 className='text-lg font-semibold mb-4'>
            Shipment Status Overview
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='value'>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Delivered'
                        ? '#4CAF50'
                        : entry.name === 'In Transit'
                        ? '#2196F3'
                        : entry.name === 'Order Picked'
                        ? '#FFC107'
                        : entry.name === 'Failed'
                        ? '#F44336'
                        : '#8884d8'
                    }
                    radius={[8, 8, 0, 0]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className='bg-white shadow rounded-lg p-6 mt-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
            <h3 className='text-2xl md:text-3xl font-bold text-[#2D4059] tracking-tight text-center w-full md:w-auto'>
              📋 Shipment History
            </h3>
            <div className='mt-4 md:mt-0'>
              <select
                className='border border-gray-300 rounded px-3 py-2 text-sm'
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value='All'>All</option>
                <option value='Order Picked'>Order Picked</option>
                <option value='In Transit'>In Transit</option>
                <option value='Delivered'>Delivered</option>
                <option value='Failed'>Failed</option>
              </select>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full table-auto text-sm text-left border rounded'>
              <thead className='bg-[#88BDF2] text-[#384959] font-semibold'>
                <tr>
                  <th className='px-4 py-2'>Date</th>
                  <th className='px-4 py-2'>Sender</th>
                  <th className='px-4 py-2'>Receiver</th>
                  <th className='px-4 py-2'>Receiver Address</th>
                  <th className='px-4 py-2'>Size</th>
                  <th className='px-4 py-2'>Price (₹)</th>
                  <th className='px-4 py-2'>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td
                      className='px-4 py-2 text-center text-gray-500'
                      colSpan={6}
                    >
                      No shipments found.
                    </td>
                  </tr>
                ) : (
                  filteredShipments
                    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                    .slice(0, 10)
                    .map((ship) => (
                      <tr
                        key={ship.id}
                        className='border-t hover:bg-[#dceefe] transition'
                      >
                        <td className='px-4 py-2'>
                          {ship.createdAt
                            ? format(
                                new Date(ship.createdAt.seconds * 1000),
                                'dd MMM yyyy'
                              )
                            : 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          {ship.sender?.name || 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          {ship.receiver?.name || 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          {ship.receiver?.address || 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          {ship.package?.size || 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          {ship.price ? `₹${ship.price}` : 'N/A'}
                        </td>
                        <td className='px-4 py-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className='bg-[#384959] text-white text-center text-sm py-4'>
        &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
      </footer>
    </div>
  );
}

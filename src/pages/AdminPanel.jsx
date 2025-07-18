import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaShippingFast, FaSignOutAlt } from 'react-icons/fa';

const AdminPanel = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const shipmentsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  useEffect(() => {
    const fetchShipments = async () => {
      const snapshot = await getDocs(collection(db, 'shipments'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShipments(data);
    };

    fetchShipments();
  }, []);

  useEffect(() => {
    let result = [...shipments];

    if (statusFilter !== 'All') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.sender.localeCompare(b.sender));
    } else if (sortBy === 'date') {
      result.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }

    setFilteredShipments(result);
    setCurrentPage(1); // Reset to page 1 on filter/sort change
  }, [shipments, statusFilter, sortBy]);

  const updateStatus = async (id, status) => {
    const shipmentRef = doc(db, 'shipments', id);
    await updateDoc(shipmentRef, { status });
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, status } : shipment
      )
    );
  };

  const deleteShipment = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      await deleteDoc(doc(db, 'shipments', id));
      setShipments((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600 text-white';
      case 'In Transit':
        return 'bg-blue-600 text-white';
      case 'Order Picked':
        return 'bg-yellow-500 text-white';
      case 'Failed':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-300 text-black';
    }
  };

  const indexOfLastShipment = currentPage * shipmentsPerPage;
  const indexOfFirstShipment = indexOfLastShipment - shipmentsPerPage;
  const currentShipments = filteredShipments.slice(
    indexOfFirstShipment,
    indexOfLastShipment
  );
  const totalPages = Math.ceil(filteredShipments.length / shipmentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <p className='p-6'>Loading...</p>;

  if (userRole !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <div className='bg-[#BDDDFC] min-h-screen font-sans flex flex-col'>
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

      {/* Filters */}
      <div className='flex-grow'>
        <div className='max-w-6xl mx-auto p-6 bg-white mt-6 rounded-lg shadow'>
          <h2 className='text-2xl font-bold text-[#384959] mb-4 text-center'>
            Manage Shipments
          </h2>
          <div className='flex flex-col sm:flex-row gap-4 justify-between items-center mb-4'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='p-2 rounded border border-[#88BDF2] focus:outline-none'
            >
              <option value='All'>All Shipments</option>
              <option value='Order Picked'>Order Picked</option>
              <option value='In Transit'>In Transit</option>
              <option value='Delivered'>Delivered</option>
              <option value='Failed'>Failed</option>
            </select>

            <button
              onClick={() =>
                setSortBy((prev) => (prev === 'date' ? 'name' : 'date'))
              }
              className='bg-[#384959] text-white px-4 py-2 rounded hover:bg-[#2F3A44]'
            >
              Sort by: {sortBy === 'date' ? 'Date' : 'Sender Name'}
            </button>
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse bg-white'>
              <thead>
                <tr className='bg-[#88BDF2] text-[#384959]'>
                  <th className='p-2 text-left'>Sender</th>
                  <th className='p-2 text-left'>Receiver</th>
                  <th className='p-2 text-left'>Package Size</th>
                  <th className='p-2 text-left'>Address</th>
                  <th className='p-2 text-left'>Status</th>
                  <th className='p-2 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className='border-t hover:bg-[#dceefe] text-sm cursor-pointer'
                    onClick={() => navigate(`/shipment/${shipment.id}`)}
                  >
                    <td className='p-2'>{shipment.sender?.name}</td>
                    <td className='p-2'>{shipment.receiver?.name}</td>
                    <td className='p-2'>{shipment.package?.size}</td>
                    <td className='p-2'>{shipment.sender?.address}</td>
                    <td className='p-2'>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                          shipment.status
                        )}`}
                      >
                        {shipment.status}
                      </span>
                    </td>
                    <td
                      className='p-2 flex flex-wrap gap-2'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { label: 'Order Picked', color: 'bg-yellow-500' },
                        { label: 'In Transit', color: 'bg-blue-600' },
                        { label: 'Delivered', color: 'bg-green-600' },
                        { label: 'Failed', color: 'bg-red-600' },
                      ].map(({ label, color }) => (
                        <button
                          key={label}
                          onClick={() => updateStatus(shipment.id, label)}
                          className={`${color} px-3 py-1 rounded text-white text-sm min-w-[110px]`}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteShipment(shipment.id)}
                        className='bg-gray-700 px-3 py-1 rounded text-white text-sm min-w-[110px]'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* No Shipments */}
            {filteredShipments.length === 0 && (
              <p className='text-center text-gray-600 py-6'>
                No shipments to display.
              </p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className='flex justify-center mt-6 gap-2 flex-wrap'>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-[#384959] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
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
};

export default AdminPanel;

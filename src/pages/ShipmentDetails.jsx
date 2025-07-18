import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { FaShippingFast, FaSignOutAlt } from 'react-icons/fa';

const ShipmentDetails = ({ userRole }) => {
  const isAdmin = userRole === 'admin';
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const ref = doc(db, 'shipments', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('not‑found');
        setShipment({ id: snap.id, ...snap.data() });
      } catch (err) {
        alert('Shipment not found');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [id, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  useEffect(() => {
    if (!shipment || !editMode) return;
    const { weight, deliverySpeed } = shipment.package || {};
    const sizeMultiplier =
      shipment.package?.size === 'Small'
        ? 1
        : shipment.package?.size === 'Medium'
        ? 1.5
        : 2;
    const speedMultiplier = deliverySpeed === 'Express' ? 1.5 : 1;
    const basePrice = 50;
    const weightRate = 20;
    if (weight && deliverySpeed) {
      const newPrice = Math.round(
        (basePrice + parseFloat(weight) * weightRate) *
          sizeMultiplier *
          speedMultiplier
      );
      setShipment((prev) => ({ ...prev, price: newPrice }));
    }
  }, [
    shipment?.package?.weight,
    shipment?.package?.deliverySpeed,
    shipment?.package?.size,
    editMode,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setShipment((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setShipment((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id: _, ...dataToSave } = shipment;
      await updateDoc(doc(db, 'shipments', id), dataToSave);
      alert('✅ Shipment updated!');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update shipment');
    }
    setSaving(false);
  };

  const getStatusBadge = (status) => {
    const base =
      'text-white text-xs font-semibold px-2 py-1 rounded-full inline-block';
    switch (status) {
      case 'Delivered':
        return `${base} bg-green-600`;
      case 'In Transit':
        return `${base} bg-yellow-500`;
      case 'Order Picked':
        return `${base} bg-blue-500`;
      case 'Failed':
        return `${base} bg-red-600`;
      case 'Pending':
      default:
        return `${base} bg-gray-500`;
    }
  };

  const renderRow = (label, fieldPath, type = 'text') => {
    const [section, field] = fieldPath.includes('.')
      ? fieldPath.split('.')
      : [null, fieldPath];
    const value = section ? shipment[section]?.[field] : shipment[field];
    const isEditable = isAdmin && editMode;

    return (
      <tr className='border-b transition-transform duration-200 hover:scale-[1.01]'>
        <td className='font-semibold text-[#384959] p-3 w-1/3 bg-blue-50'>
          {label}
        </td>
        <td className='p-3'>
          {isEditable ? (
            type === 'select-status' ? (
              <select
                name={fieldPath}
                value={value}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              >
                <option value='Pending'>Pending</option>
                <option value='Order Picked'>Order Picked</option>
                <option value='In Transit'>In Transit</option>
                <option value='Delivered'>Delivered</option>
                <option value='Failed'>Failed</option>
              </select>
            ) : type === 'select-size' ? (
              <select
                name={fieldPath}
                value={value}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              >
                <option value='Small'>Small</option>
                <option value='Medium'>Medium</option>
                <option value='Large'>Large</option>
              </select>
            ) : type === 'select-speed' ? (
              <select
                name={fieldPath}
                value={value}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              >
                <option value='Standard'>Standard</option>
                <option value='Express'>Express</option>
              </select>
            ) : (
              <input
                type={type}
                name={fieldPath}
                value={value}
                onChange={handleChange}
                className='border p-2 rounded w-full'
              />
            )
          ) : fieldPath === 'status' ? (
            <span className={getStatusBadge(value)}>{value}</span>
          ) : (
            <span>{value || '-'}</span>
          )}
        </td>
      </tr>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500' />
      </div>
    );

  return (
    <div className='min-h-screen bg-[#BDDDFC] font-sans'>
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
          {isAdmin ? (
            <button
              onClick={() => navigate('/admin')}
              className='bg-[#6A89A7] text-white px-4 py-2 rounded hover:bg-[#2F3A44] transition-colors'
            >
              Admin Panel
            </button>
          ) : (
            <button
              onClick={() => navigate('/my-shipments')}
              className='bg-[#6A89A7] text-white px-4 py-2 rounded hover:bg-[#2F3A44] transition-colors'
            >
              My Shipments
            </button>
          )}

          <button
            onClick={handleLogout}
            className='flex items-center gap-2 bg-red-600 px-4 py-2 text-sm rounded hover:bg-red-700 transition'
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div
        className='max-w-4xl mx-auto p-6 mt-6 bg-white rounded-xl shadow-lg'
        ref={printRef}
      >
        <table className='w-full border border-gray-200 rounded overflow-hidden'>
          <tbody>
            <tr className='bg-[#88BDF2]'>
              <td
                colSpan={2}
                className='p-2 text-lg font-bold text-[#2D4059] text-center'
              >
                📤 Sender Details
              </td>
            </tr>
            {renderRow('Name', 'sender.name')}
            {renderRow('Email', 'sender.email')}
            {renderRow('Phone', 'sender.phone')}
            {renderRow('Address', 'sender.address')}
            {renderRow('Pincode', 'sender.pincode')}

            <tr className='bg-[#88BDF2]'>
              <td
                colSpan={2}
                className='p-2 text-lg font-bold text-[#2D4059] text-center'
              >
                📥 Receiver Details
              </td>
            </tr>
            {renderRow('Name', 'receiver.name')}
            {renderRow('Email', 'receiver.email')}
            {renderRow('Phone', 'receiver.phone')}
            {renderRow('Address', 'receiver.address')}
            {renderRow('Pincode', 'receiver.pincode')}

            <tr className='bg-[#88BDF2]'>
              <td
                colSpan={2}
                className='p-2 text-lg font-bold text-[#2D4059] text-center'
              >
                📦 Package Details
              </td>
            </tr>
            {renderRow('Size', 'package.size', 'select-size')}
            {renderRow('Weight (kg)', 'package.weight', 'number')}
            {renderRow(
              'Delivery Speed',
              'package.deliverySpeed',
              'select-speed'
            )}

            <tr className='bg-[#88BDF2]'>
              <td
                colSpan={2}
                className='p-2 text-lg font-bold text-[#2D4059] text-center'
              >
                🚚 Shipment Info
              </td>
            </tr>
            {renderRow('Status', 'status', 'select-status')}
            {renderRow('Price (₹)', 'price', 'number')}
          </tbody>
        </table>

        <div className='mt-6 flex flex-wrap gap-4 justify-end'>
          <button
            onClick={handlePrint}
            className='bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700'
          >
            Print / Download
          </button>

          {isAdmin && editMode && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className='bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700'
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className='bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600'
              >
                Cancel
              </button>
            </>
          )}

          {isAdmin && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className='bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700'
            >
              Edit Shipment
            </button>
          )}

          <button
            onClick={() => navigate(-1)}
            className='bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400'
          >
            Back
          </button>
        </div>
      </div>

      <footer className='bg-[#384959] text-white text-center text-sm py-4 mt-10'>
        &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
      </footer>
    </div>
  );
};

export default ShipmentDetails;

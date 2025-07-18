import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateShipment from './pages/CreateShipment';
import MyShipments from './pages/MyShipments';
import AdminPanel from './pages/AdminPanel';
import Home from './components/Home';
import ShipmentSuccess from './pages/ShipmentSuccess';
import ShipmentDetails from './pages/ShipmentDetails';

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const roleRef = doc(db, 'users', currentUser.uid);
          const roleSnap = await getDoc(roleRef);
          if (roleSnap.exists()) {
            setUserRole(roleSnap.data().role);
          } else {
            setUserRole('user');
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {loading ? (
        <div className='flex justify-center items-center min-h-screen'>
          <p className='text-lg text-gray-700'>Loading...</p>
        </div>
      ) : (
        <Routes>
          {/* Public Home Page */}
          <Route path='/' element={<Home user={user} userRole={userRole} />} />

          {/* Login and Register */}
          <Route
            path='/login'
            element={!user ? <Login /> : <Navigate to='/dashboard' />}
          />
          <Route
            path='/register'
            element={!user ? <Register /> : <Navigate to='/dashboard' />}
          />

          {/* Protected Routes */}
          <Route
            path='/dashboard'
            element={
              user ? <Dashboard user={user} /> : <Navigate to='/login' />
            }
          />

          <Route
            path='/create-shipment'
            element={
              user ? <CreateShipment user={user} /> : <Navigate to='/login' />
            }
          />
          <Route
            path='/shipment-success/:trackingId'
            element={<ShipmentSuccess />}
          />

          <Route
            path='/my-shipments'
            element={
              user ? <MyShipments user={user} /> : <Navigate to='/login' />
            }
          />
          <Route
            path='/admin'
            element={
              user && userRole === 'admin' ? (
                <AdminPanel user={user} />
              ) : (
                <Navigate to='/login' />
              )
            }
          />
          <Route
            path='/shipment/:id'
            element={<ShipmentDetails userRole={userRole} />}
          />
        </Routes>
      )}
    </Router>
  );
}

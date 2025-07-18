import React from 'react';
import { Link } from 'react-router-dom';
import { FaShippingFast, FaMapMarkedAlt, FaCheckCircle } from 'react-icons/fa';
import { BsPersonBoundingBox } from 'react-icons/bs';
import { MdOutlineTrackChanges } from 'react-icons/md';
import shippingIllustration from '../assets/shipping-illustration.png';
import customerSupport from '../assets/customer-support.png';

export default function Home({ user, userRole }) {
  return (
    <div className='bg-[#BDDDFC] min-h-screen overflow-x-hidden font-sans'>
      {/* Header */}
      <header className='bg-[#384959] shadow-md sticky top-0 z-50 w-full'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2'>
            <FaShippingFast className='text-[#88BDF2] text-3xl' /> DakiyaXpress
          </h1>
          <div className='flex items-center gap-4 text-sm md:text-base'>
            {user ? (
              <Link
                to='/dashboard'
                className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#384959] transition-colors'
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to='/login'
                className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#384959] transition-colors'
              >
                Login
              </Link>
            )}

            <Link
              to='/register'
              className='bg-[#6A89A7] text-white px-4 py-2 rounded-md hover:bg-[#384959] transition-colors'
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='text-center py-16 px-4 bg-[#BDDDFC]'>
        <div className='max-w-5xl mx-auto'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#384959] leading-tight mb-4'>
            Fast, Reliable & Hassle-Free Shipping
          </h2>
          <p className='text-md sm:text-lg text-[#6A89A7] mb-6'>
            Manage all your shipments in one place with real-time tracking and
            smooth delivery.
          </p>
          <Link
            to='/register'
            className='inline-block bg-[#384959] text-white px-6 py-3 rounded-md text-base font-medium hover:bg-[#2F3A44] transition-colors'
          >
            Create a Shipment
          </Link>
          <img
            src={shippingIllustration}
            alt='Shipping illustration'
            className='mt-12 w-full max-w-xl mx-auto animate-fade-in'
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-16 px-4 bg-white'>
        <div className='max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center'>
          {[
            {
              icon: (
                <FaMapMarkedAlt className='text-4xl text-[#384959] mx-auto mb-4' />
              ),
              title: 'Real-time Tracking',
              desc: 'Know exactly where your packages are, anytime.',
            },
            {
              icon: (
                <BsPersonBoundingBox className='text-4xl text-[#384959] mx-auto mb-4' />
              ),
              title: 'User-Friendly Dashboard',
              desc: 'Manage your shipments with our intuitive interface.',
            },
            {
              icon: (
                <MdOutlineTrackChanges className='text-4xl text-[#384959] mx-auto mb-4' />
              ),
              title: 'On-Time Delivery',
              desc: 'We ensure your goods arrive when they’re expected.',
            },
          ].map(({ icon, title, desc }, index) => (
            <div
              key={index}
              className='bg-[#BDDDFC] p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300'
            >
              {icon}
              <h3 className='text-xl font-semibold mb-2 text-[#384959]'>
                {title}
              </h3>
              <p className='text-[#6A89A7]'>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order Status Section */}
      <section className='py-16 px-4 bg-[#88BDF2]'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-#384959 mb-12'>
            What's your order Status?
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
            {[
              {
                icon: <FaCheckCircle className='text-#384959 text-3xl mb-3' />,
                label: 'Order Received',
                desc: 'Your order has been received by your courier partner',
              },
              {
                icon: (
                  <BsPersonBoundingBox className='text-#384959 text-3xl mb-3' />
                ),
                label: 'Order Picked',
                desc: 'Your order has been picked up by your courier partner',
              },
              {
                icon: <FaShippingFast className='text-#384959 text-3xl mb-3' />,
                label: 'Order In Transit',
                desc: 'Your order is on its way to your customer’s address',
              },
              {
                icon: (
                  <MdOutlineTrackChanges className='text-#384959 text-3xl mb-3' />
                ),
                label: 'Out For Delivery',
                desc: 'The courier executive is on the way to deliver the order',
              },
              {
                icon: <FaMapMarkedAlt className='text-#384959 text-3xl mb-3' />,
                label: 'Reached Destination',
                desc: "Your order has reached your customer's city",
              },
            ].map(({ icon, label, desc }, index) => (
              <div
                key={index}
                className='flex flex-col items-center bg-[#BDDDFC] p-4 rounded-lg shadow hover:shadow-md transition-all'
              >
                {icon}
                <h3 className='text-lg font-semibold mb-1 text-[#384959]'>
                  {label}
                </h3>
                <p className='text-sm text-[#6A89A7]'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-16 px-4 bg-white'>
        <div className='max-w-5xl mx-auto text-center'>
          <h2 className='text-3xl font-bold text-[#384959] mb-12'>
            What Our Customers Say
          </h2>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-6'>
            {[
              'DakiyaXpress made our delivery process smooth and dependable. Highly recommend!',
              'Excellent service and support. The dashboard is incredibly easy to use.',
              'Real-time tracking keeps my customers informed. Love it!',
            ].map((quote, index) => (
              <div
                key={index}
                className='bg-[#BDDDFC] p-6 rounded-lg shadow-md hover:shadow-lg'
              >
                <p className='text-[#6A89A7] italic'>"{quote}"</p>
                <h4 className='mt-4 font-semibold text-[#384959]'>
                  - Customer {index + 1}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Support */}
      <section className='py-16 px-4 bg-[#88BDF2]'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10'>
          <img
            src={customerSupport}
            alt='Customer support'
            className='w-full max-w-md mx-auto rounded-lg'
          />
          <div className='text-center md:text-left'>
            <h2 className='text-3xl font-bold text-384959 mb-4'>
              We're Here to Help
            </h2>
            <p className='text-6A89A7 mb-4'>
              Have questions or need assistance? <br />
              Our support team is available 24/7 to guide you.
            </p>
            <Link
              to='/register'
              className='bg-[#384959] text-white px-6 py-3 rounded-md hover:bg-[#2F3A44] transition-colors inline-block'
            >
              Start Shipping Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-[#384959] text-white py-6 mt-10'>
        <div className='max-w-6xl mx-auto text-center text-sm'>
          &copy; {new Date().getFullYear()} DakiyaXpress. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

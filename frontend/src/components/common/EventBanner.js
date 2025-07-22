import React, { useEffect, useState } from 'react';
import productAPI from '../../api/productAPI';
import { Link } from 'react-router-dom';

const promoPhrases = [
  'Limited Time Offer!',
  'Hurry Up!',
  'Best Deal Today!',
  'Don\'t Miss Out!',
  'Shop Now & Save!',
  'Exclusive Event!',
];

const EventBanner = () => {
  const [event, setEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [promoIndex, setPromoIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    productAPI.getEventBanner().then(res => {
      setEvent(res.data);
      if (res.data && res.data.endDate) {
        updateCountdown(res.data.endDate);
      }
    });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!event || !event.endDate) return;
    const interval = setInterval(() => {
      updateCountdown(event.endDate);
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [event]);

  // Animated promo text
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPromoIndex((prev) => (prev + 1) % promoPhrases.length);
        setFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    setTimeLeft({ days, hours, minutes, seconds });
  };

  if (!event || !event.product) return null;

  return (
    <section className="w-full bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl shadow-lg p-4 md:p-8 my-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
        {/* Left: Product */}
        <div className="flex flex-col items-center md:items-center w-full md:w-1/3 mb-6 md:mb-0">
          <img
            src={event.product.images && event.product.images[0]?.url ? event.product.images[0].url : '/product-images/default.webp'}
            alt={event.product.name}
            className="w-48 h-36 md:w-64 md:h-48 object-contain rounded-lg shadow-md bg-white"
          />
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold">{event.product.name}</h3>
            <p className="text-primary-600 font-semibold text-lg">₹{event.product.price}</p>
          </div>
        </div>
        {/* Right: Event Info & Countdown */}
        <div className="flex flex-col items-center md:items-start w-full md:w-2/3">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">{event.title}</h2>
          <p className="text-lg mb-6 text-center md:text-left">{event.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Hr</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Min</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Sc</div>
            </div>
          </div>
          <Link
            to={`/products/${event.product._id}`}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg shadow w-full md:w-auto text-center"
          >
            Go Shopping &rarr;
          </Link>
        </div>
        {/* Animated Promo Text on Right */}
        <div className="hidden md:block absolute right-8 top-1/2 transform -translate-y-1/2 w-1/3 text-right pointer-events-none select-none">
          <span
            className={`text-4xl font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ letterSpacing: '2px' }}
          >
            {promoPhrases[promoIndex]}
          </span>
        </div>
        {/* On mobile, show below */}
        <div className="block md:hidden w-full text-center mt-6">
          <span
            className={`text-2xl font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ letterSpacing: '2px' }}
          >
            {promoPhrases[promoIndex]}
          </span>
        </div>
      </div>
    </section>
  );
};

export default EventBanner; 
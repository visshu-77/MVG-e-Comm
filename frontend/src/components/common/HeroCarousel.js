import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    image: './images/banner_1.jpg',
    headline: 'Discover Amazing Products',
    subheadline: 'Shop from thousands of verified sellers and find the best deals on quality products.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_3.jpg',
    headline: 'Trendy Collections',
    subheadline: 'Explore the latest trends and exclusive offers from top brands.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_2.jpg',
    headline: 'Quality Guaranteed',
    subheadline: 'Only the best products from trusted sellers, with easy returns.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
];

const contentVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.5, ease: 'easeIn' } },
};

const HeroCarousel = () => {
  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
        }}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="absolute inset-0 w-full h-full z-0"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.7)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-[60vh] md:h-[80vh] px-4">
              <motion.div
                className="text-center"
                initial="initial"
                whileInView="animate"
                exit="exit"
                variants={contentVariants}
                viewport={{ once: true }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                  {slide.headline}
                </h1>
                <p className="text-xl md:text-2xl text-white mb-8 drop-shadow-md">
                  {slide.subheadline}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-primary-600 hover:text-white transition-colors text-lg md:text-xl animate-bounce"
                  tabIndex={0}
                  aria-label={slide.buttonText}
                >
                  {slide.buttonText}
                </Link>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-primary-700/40 z-5 pointer-events-none" />
    </section>
  );
};

export default HeroCarousel; 
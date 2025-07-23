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
    image: './images/banner_1.png',
    headline: 'Discover Amazing Products',
    subheadline: 'Shop from thousands of verified sellers and find the best deals on quality products.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_3.png',
    headline: 'Trendy Collections',
    subheadline: 'Explore the latest trends and exclusive offers from top brands.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_2.png',
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
    <section className="relative w-full min-h-[30vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
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
                filter: 'brightness(1)',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-[30vh] md:h-[90vh] px-4">
              <motion.div
                className="text-center"
                initial="initial"
                whileInView="animate"
                exit="exit"
                variants={contentVariants}
                viewport={{ once: true }}
              >
              
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
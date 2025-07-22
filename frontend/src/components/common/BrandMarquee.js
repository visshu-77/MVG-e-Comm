import React from 'react';

// Example brand data for different categories
const brandMap = {
  Electronics: [
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Sony_wordmark.svg' },
    { name: 'OnePlus', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/OnePlus_logo.svg' },
    { name: 'Vivo', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Vivo_logo_2019.svg' },
    { name: 'Oppo', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/OPPO_LOGO_2019.svg' },
    { name: 'Realme', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Realme_logo.svg' },
    { name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
    { name: 'Motorola', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Motorola_logo.svg' },
    { name: 'Nokia', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Nokia_wordmark.svg' },
  ],
  Fashion: [
    { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Puma_logo.svg' },
    { name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Zara_Logo.svg' },
    { name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
    { name: 'Levi\'s', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Levi%27s_logo.svg' },
    { name: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Gucci_Logo.svg' },
    { name: 'Louis Vuitton', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Louis_Vuitton_logo_and_wordmark.svg' },
  ],
  Books: [
    { name: 'Penguin', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Penguin_Books_logo.svg' },
    { name: 'HarperCollins', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/HarperCollins_logo.svg' },
    { name: 'Simon & Schuster', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Simon_%26_Schuster_logo.svg' },
    { name: 'Random House', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Random_House_logo.svg' },
  ],
  Home: [
    { name: 'IKEA', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Ikea_logo.svg' },
    { name: 'Philips', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Philips_logo.svg' },
    { name: 'Whirlpool', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Whirlpool_logo.svg' },
    { name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/LG_logo_%282015%29.svg' },
  ],
  Sports: [
    { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Puma_logo.svg' },
    { name: 'Reebok', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Reebok_2019_logo.svg' },
  ],
  Beauty: [
    { name: 'L\'Oreal', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Logo_L%27Oreal.svg' },
    { name: 'Maybelline', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Maybelline_logo.svg' },
    { name: 'Lakme', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Lakme_logo.svg' },
    { name: 'Dove', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Dove_logo.svg' },
  ],
  Automotive: [
    { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_logo.svg' },
    { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda-logo.svg' },
    { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg' },
    { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  ],
  Food: [
    { name: 'Nestle', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Nestle_textlogo.svg' },
    { name: 'Kellogg\'s', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Kellogg%27s_logo.svg' },
    { name: 'Pepsi', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Pepsi_logo_2014.svg' },
    { name: 'Coca-Cola', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Coca-Cola_logo.svg' },
  ],
  Jewelry: [
    { name: 'Tiffany & Co.', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Tiffany_%26_Co._logo.svg' },
    { name: 'Cartier', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Cartier_logo.svg' },
    { name: 'Swarovski', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Swarovski_logo.svg' },
    { name: 'Pandora', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Pandora_logo.svg' },
  ],
  Pets: [
    { name: 'Pedigree', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Pedigree_logo.svg' },
    { name: 'Whiskas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Whiskas_logo.svg' },
    { name: 'Purina', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Purina_logo.svg' },
    { name: 'Royal Canin', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Royal_Canin_logo.svg' },
  ],
};

const BrandMarquee = ({ category }) => {
  let brands = [];
  if (category && brandMap[category]) {
    brands = brandMap[category];
  } else {
    // Show all brands if no category or unknown category
    brands = Object.values(brandMap).flat();
  }
  // Duplicate brands for seamless looping
  const marqueeBrands = [...brands, ...brands];
  return (
    <div className="w-full bg-white py-6 overflow-hidden">
      <div className="relative">
        <div className="brand-marquee flex items-center whitespace-nowrap animate-marquee">
          {marqueeBrands.map((brand, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center mx-8 min-w-[120px]"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-12 w-auto mb-2 object-contain grayscale hover:grayscale-0 transition duration-300"
                loading="lazy"
                style={{ maxWidth: 80 }}
              />
              <span className="font-semibold text-gray-800 text-base md:text-lg text-center">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Marquee animation styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
        @media (max-width: 768px) {
          .brand-marquee > div { min-width: 90px; margin-left: 1rem; margin-right: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default BrandMarquee; 
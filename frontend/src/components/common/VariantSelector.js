import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';

const VariantSelector = ({ 
  product, 
  selectedVariants, 
  onVariantChange, 
  onVariantSelect,
  className = '' 
}) => {
  const [currentPrice, setCurrentPrice] = useState(product?.price || 0);
  const [currentComparePrice, setCurrentComparePrice] = useState(product?.comparePrice || 0);
  const [currentStock, setCurrentStock] = useState(product?.stock || 0);
  const [currentImages, setCurrentImages] = useState(product?.images || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDefaultSelected, setIsDefaultSelected] = useState(false);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);

  // Update current values when variants change
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setCurrentPrice(product?.price || 0);
      setCurrentComparePrice(product?.comparePrice || 0);
      setCurrentStock(product?.stock || 0);
      setCurrentImages(product?.images || []);
      return;
    }

    // Find the selected variant option
    let selectedOption = null;
    for (const variant of product.variants) {
      const selectedValue = selectedVariants[variant.name];
      if (selectedValue) {
        const option = variant.options.find(opt => opt.value === selectedValue);
        if (option) {
          selectedOption = option;
          break;
        }
      }
    }

    if (selectedOption) {
      setCurrentPrice(selectedOption.price);
      setCurrentComparePrice(selectedOption.comparePrice || 0);
      setCurrentStock(selectedOption.stock);
      setCurrentImages(selectedOption.images && selectedOption.images.length > 0 
        ? selectedOption.images 
        : product.images || []);
      setSelectedImageIndex(0);
    } else {
      // Use base product values
      setCurrentPrice(product.price);
      setCurrentComparePrice(product.comparePrice || 0);
      setCurrentStock(product.stock);
      setCurrentImages(product.images || []);
    }
  }, [selectedVariants, product]);

  // Utility to generate all combinations (SKUs) from variants
  function getAllSKUs(product) {
    if (!product.variants || product.variants.length === 0) return [];
    // Start with an array of empty combination
    let combinations = [{}];
    for (const variant of product.variants) {
      const newCombinations = [];
      for (const combo of combinations) {
        for (const option of variant.options) {
          newCombinations.push({ ...combo, [variant.name]: option.value, _option: option });
        }
      }
      combinations = newCombinations;
    }
    return combinations;
  }

  const [selectedSKU, setSelectedSKU] = useState('default');

  const allSKUs = getAllSKUs(product);

  const handleSKUSelect = (skuKey) => {
    setSelectedSKU(skuKey);
    if (skuKey === 'default') {
      onVariantChange({});
    } else {
      // Find the SKU object
      const skuObj = allSKUs.find(sku => Object.entries(sku).filter(([k]) => k !== '_option').map(([k, v]) => `${k}:${v}`).join('|') === skuKey);
      if (skuObj) {
        const selectedVariants = {};
        for (const key in skuObj) {
          if (key !== '_option') selectedVariants[key] = skuObj[key];
        }
        onVariantChange(selectedVariants);
      }
    }
  };

  const handleDefaultSelect = () => {
    setIsDefaultSelected(true);
    onVariantChange({}); // No variants selected
  };

  const handleVariantChange = (variantName, value) => {
    setIsDefaultSelected(false);
    const newSelectedVariants = { ...selectedVariants, [variantName]: value };
    onVariantChange(newSelectedVariants);
    
    // Find the selected option to update current values
    const variant = product.variants.find(v => v.name === variantName);
    if (variant) {
      const option = variant.options.find(opt => opt.value === value);
      if (option) {
        setCurrentPrice(option.price);
        setCurrentComparePrice(option.comparePrice || 0);
        setCurrentStock(option.stock);
        if (option.images && option.images.length > 0) {
          setCurrentImages(option.images);
          setSelectedImageIndex(0);
        }
      }
    }
  };

  const isOptionAvailable = (option) => {
    return option.isActive && option.stock > 0;
  };

  const getOptionStatus = (option) => {
    if (!option.isActive) return 'disabled';
    if (option.stock === 0) return 'out-of-stock';
    return 'available';
  };

  // Filter out empty/deleted variants
  const filteredVariants = (product.variants || []).filter(v => v.options && v.options.length > 0);

  // When switching variant group, auto-select the first available option
  const handleVariantGroupSwitch = (idx) => {
    setActiveVariantIdx(idx);
    const variant = filteredVariants[idx];
    if (variant && variant.options && variant.options.length > 0) {
      const firstAvailable = variant.options.find(opt => opt.isActive && opt.stock > 0) || variant.options[0];
      if (firstAvailable) {
        handleVariantChange(variant.name, firstAvailable.value);
      }
    }
  };

  if (!product?.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Product base option and variant group switcher in a single row */}
      <div className="flex flex-row flex-wrap gap-2 items-start mb-2">
        <button
          type="button"
          onClick={() => {
            setSelectedSKU('default');
            onVariantChange({});
          }}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all bg-white text-gray-700 border-gray-300 hover:border-gray-400`}
        >
          {product.name}
        </button>
        {/* Variant group switcher as buttons */}
        {filteredVariants.length > 1 && filteredVariants.map((variant, idx) => (
          <button
            key={variant.name}
            type="button"
            onClick={() => handleVariantGroupSwitch(idx)}
            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${activeVariantIdx === idx ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'}`}
          >
            {variant.name}
          </button>
        ))}
      </div>
      {/* Only show the active variant group's options as buttons, no label/row */}
      {filteredVariants.length > 0 && (
        <div className="flex flex-row flex-wrap gap-2 mb-2">
          {filteredVariants[activeVariantIdx].options.map((option, oIdx) => {
            const isSelected = selectedVariants[filteredVariants[activeVariantIdx].name] === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleVariantChange(filteredVariants[activeVariantIdx].name, option.value)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all shadow-sm
                  ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'}`}
                disabled={!option.isActive || option.stock === 0}
              >
                {option.value}
              </button>
            );
          })}
        </div>
      )}
      {/* Variant images below selectors */}
      {currentImages.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant Images
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {currentImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 border-2 rounded-lg overflow-hidden w-16 h-16 ${
                  selectedImageIndex === index ? 'border-blue-600' : 'border-gray-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={`${product.name} variant ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Current variant info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Current Price:</span>
            <span className="font-semibold text-lg text-blue-600">
              ₹{currentPrice}
            </span>
          </div>
          {currentComparePrice > currentPrice && (
            <div className="flex justify-between items-center mt-1">
              <span>Original Price:</span>
              <span className="line-through text-gray-500">
                ₹{currentComparePrice}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center mt-1">
            <span>Stock:</span>
            <span className={`font-medium ${currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentStock > 0 ? `${currentStock} available` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector; 
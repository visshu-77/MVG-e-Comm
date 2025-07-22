import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaSave, FaTimes } from 'react-icons/fa';
import productAPI from '../../api/productAPI';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosConfig';

const VariantManager = ({ product, onVariantUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [newVariant, setNewVariant] = useState({
    variantName: '',
    options: [{ value: '', price: '', comparePrice: '', stock: '', sku: '', isActive: true }]
  });

  const [editForm, setEditForm] = useState({
    variantName: '',
    optionValue: '',
    updates: {}
  });

  const handleAddOption = () => {
    setNewVariant(prev => ({
      ...prev,
      options: [...prev.options, { value: '', price: '', comparePrice: '', stock: '', sku: '', isActive: true }]
    }));
  };

  const handleRemoveOption = (index) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleOptionImagesChange = (index, images) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, images } : option
      )
    }));
  };

  const handleOptionSpecsChange = (index, specs) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, specifications: specs } : option
      )
    }));
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!newVariant.variantName.trim()) {
        toast.error('Variant name is required');
        return;
      }

      for (const option of newVariant.options) {
        if (!option.value.trim() || !option.price || !option.sku.trim()) {
          toast.error('All options must have value, price, and SKU');
          return;
        }
      }

      // Check for duplicate SKUs
      const skus = newVariant.options.map(opt => opt.sku);
      const uniqueSkus = new Set(skus);
      if (uniqueSkus.size !== skus.length) {
        toast.error('Duplicate SKUs are not allowed');
        return;
      }

      await productAPI.addVariant(product._id, newVariant);
      toast.success('Variant added successfully');
      setShowAddForm(false);
      setNewVariant({
        variantName: '',
        options: [{ value: '', price: '', comparePrice: '', stock: '', sku: '', isActive: true }]
      });
      onVariantUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVariant = (variantName, optionValue) => {
    const variant = product.variants.find(v => v.name === variantName);
    const option = variant?.options.find(opt => opt.value === optionValue);
    
    if (option) {
      setEditForm({
        variantName,
        optionValue,
        updates: { ...option }
      });
      setEditingVariant({ variantName, optionValue });
    }
  };

  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productAPI.updateVariantOption(product._id, editForm);
      toast.success('Variant updated successfully');
      setEditingVariant(null);
      setEditForm({ variantName: '', optionValue: '', updates: {} });
      onVariantUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update variant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantName, optionValue) => {
    if (!window.confirm('Are you sure you want to delete this variant option?')) {
      return;
    }

    setLoading(true);
    try {
      await productAPI.deleteVariantOption(product._id, { variantName, optionValue });
      toast.success('Variant option deleted successfully');
      onVariantUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete variant');
    } finally {
      setLoading(false);
    }
  };

  // Helper for uploading image for a variant option
  const handleOptionImageUpload = async (index, files) => {
    if (!files || files.length === 0) return;
    try {
      let uploaded = newVariant.options[index].images ? [...newVariant.options[index].images] : [];
      for (const file of files) {
        if (uploaded.length >= 5) break;
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosInstance.post(`/products/${product._id}/variant-option-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = res.data.url;
        uploaded.push({ url });
      }
      handleOptionImagesChange(index, uploaded);
    } catch (error) {
      toast.error('Image upload failed');
    }
  };

  // Helpers for dynamic specs
  const handleAddSpec = (index) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, specifications: [...(option.specifications || []), { key: '', value: '' }] } : option
      )
    }));
  };
  const handleRemoveSpec = (index, specIdx) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, specifications: (option.specifications || []).filter((_, j) => j !== specIdx) } : option
      )
    }));
  };
  const handleSpecChange = (index, specIdx, field, value) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? {
          ...option,
          specifications: (option.specifications || []).map((spec, j) =>
            j === specIdx ? { ...spec, [field]: value } : spec
          )
        } : option
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Existing Variants */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Variants</h3>
          <div className="space-y-4">
            {product.variants
              .filter(variant => variant.options && variant.options.length > 0)
              .map((variant) => (
                <div key={variant.name} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">{variant.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {variant.options.map((option) => (
                      <div key={option.value} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">{option.value}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditVariant(variant.name, option.value)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(variant.name, option.value)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Price: ₹{option.price}</div>
                          {option.comparePrice && <div>Compare Price: ₹{option.comparePrice}</div>}
                          <div>Stock: {option.stock}</div>
                          <div>SKU: {option.sku}</div>
                          <div className={`text-xs ${option.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {option.isActive ? 'Active' : 'Inactive'}
                          </div>
                          {option.images && option.images.length > 0 && (
                            <div>Images: {option.images.map(img => <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 mr-1">[img]</a>)}</div>
                          )}
                          {option.specifications && option.specifications.length > 0 && (
                            <div>Specs: {option.specifications.map(s => `${s.key}: ${s.value}`).join(', ')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add New Variant Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Add New Variant
        </button>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Variant</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleAddVariant} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Name (e.g., Color, Size, Storage)
              </label>
              <input
                type="text"
                value={newVariant.variantName}
                onChange={(e) => setNewVariant(prev => ({ ...prev, variantName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Color, Size, Storage"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Options
              </label>
              <div className="space-y-3">
                {newVariant.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 p-3 border rounded bg-white">
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., Red, XL, 128GB)"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      value={option.price}
                      onChange={(e) => handleOptionChange(index, 'price', parseFloat(e.target.value) || '')}
                      placeholder="Price"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      value={option.comparePrice}
                      onChange={(e) => handleOptionChange(index, 'comparePrice', parseFloat(e.target.value) || '')}
                      placeholder="Compare Price (optional)"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={option.stock}
                      onChange={(e) => handleOptionChange(index, 'stock', parseInt(e.target.value) || '')}
                      placeholder="Stock"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      value={option.sku}
                      onChange={(e) => handleOptionChange(index, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Upload Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                          const files = Array.from(e.target.files);
                          // Only allow up to 5 images per option
                          if ((option.images?.length || 0) + files.length > 5) {
                            toast.error('You can upload up to 5 images per variant option.');
                            return;
                          }
                          handleOptionImageUpload(index, files);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded w-full"
                        disabled={option.images && option.images.length >= 5}
                      />
                      {option.images && option.images.length > 0 && (
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {option.images.map((img, i) => (
                            <div key={i} className="relative group w-12 h-12">
                              <img src={img.url} alt="variant" className="w-12 h-12 object-cover rounded border" />
                              <button
                                type="button"
                                className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-600 hover:text-red-800 group-hover:visible invisible"
                                onClick={() => {
                                  // Remove image from option.images
                                  handleOptionImagesChange(index, option.images.filter((_, j) => j !== i));
                                }}
                                title="Remove"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Specifications</label>
                      {(option.specifications || []).map((spec, specIdx) => (
                        <div key={specIdx} className="flex gap-2 mb-1">
                          <input
                            type="text"
                            value={spec.key}
                            onChange={e => handleSpecChange(index, specIdx, 'key', e.target.value)}
                            placeholder="Key"
                            className="px-2 py-1 border border-gray-300 rounded w-24"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={e => handleSpecChange(index, specIdx, 'value', e.target.value)}
                            placeholder="Value"
                            className="px-2 py-1 border border-gray-300 rounded w-32"
                          />
                          <button type="button" onClick={() => handleRemoveSpec(index, specIdx)} className="text-red-600 hover:text-red-800">Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddSpec(index)} className="text-blue-600 hover:text-blue-800 text-xs mt-1">+ Add Specification</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={option.isActive}
                          onChange={(e) => handleOptionChange(index, 'isActive', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Active</span>
                      </label>
                      {newVariant.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <FaPlus size={12} /> Add Another Option
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <FaSave /> {loading ? 'Adding...' : 'Add Variant'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Variant Modal */}
      {editingVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Variant Option</h3>
            
            <form onSubmit={handleUpdateVariant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="text"
                  value={editForm.updates.value || ''}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    updates: { ...prev.updates, value: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    value={editForm.updates.price || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      updates: { ...prev.updates, price: parseFloat(e.target.value) || '' } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compare Price</label>
                  <input
                    type="number"
                    value={editForm.updates.comparePrice || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      updates: { ...prev.updates, comparePrice: parseFloat(e.target.value) || '' } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editForm.updates.stock || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      updates: { ...prev.updates, stock: parseInt(e.target.value) || '' } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={editForm.updates.sku || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      updates: { ...prev.updates, sku: e.target.value } 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.updates.isActive}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      updates: { ...prev.updates, isActive: e.target.checked } 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <FaSave /> {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantManager; 
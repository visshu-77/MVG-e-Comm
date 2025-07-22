# Product Variant Feature Implementation

## Overview

This document describes the comprehensive product variant feature implemented for the e-commerce platform. The feature allows sellers to create products with multiple variants (e.g., color, size, storage) without creating separate product entries for each variant.

## Features Implemented

### 1. Enhanced Product Model
- **Enhanced Variant Schema**: Each variant option now includes:
  - Price (can be different from base product price)
  - Compare price (for discounts)
  - Stock quantity
  - SKU (unique identifier)
  - Images (variant-specific images)
  - Weight and dimensions
  - Active/inactive status

### 2. Backend API Endpoints
- `GET /products/:id` - Enhanced to include variant information
- `POST /products/:id/variants` - Add new variant to product
- `PUT /products/:id/variants` - Update variant option
- `DELETE /products/:id/variants` - Delete variant option
- `POST /products/:id/variant` - Get specific variant by combination

### 3. Frontend Components

#### VariantSelector Component
- Dynamic variant selection with visual feedback
- Real-time price and stock updates
- Variant-specific image display
- Out-of-stock and disabled state handling
- Price difference indicators

#### VariantManager Component
- Comprehensive variant management interface for sellers
- Add new variants with multiple options
- Edit existing variant options
- Delete variant options
- Form validation and error handling

### 4. Seller Dashboard Integration
- "Manage Variants" button in product actions
- Modal interface for variant management
- Real-time updates after variant changes
- Product refresh after variant modifications

## Database Schema

### Enhanced Product Schema
```javascript
const variantOptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
  comparePrice: { type: Number, min: [0, 'Compare price cannot be negative'] },
  stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
  sku: { type: String, required: true, unique: true },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  weight: { type: Number, min: 0 },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  isActive: { type: Boolean, default: true }
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [variantOptionSchema]
});
```

## API Usage Examples

### Adding a Variant to a Product
```javascript
// POST /products/:id/variants
{
  "variantName": "Color",
  "options": [
    {
      "value": "Red",
      "price": 1500,
      "comparePrice": 1800,
      "stock": 10,
      "sku": "PROD-001-RED",
      "isActive": true
    },
    {
      "value": "Blue",
      "price": 1600,
      "comparePrice": 1900,
      "stock": 15,
      "sku": "PROD-001-BLUE",
      "isActive": true
    }
  ]
}
```

### Updating a Variant Option
```javascript
// PUT /products/:id/variants
{
  "variantName": "Color",
  "optionValue": "Red",
  "updates": {
    "price": 1550,
    "stock": 8,
    "isActive": true
  }
}
```

### Getting Product with Variants
```javascript
// GET /products/:id
{
  "_id": "product_id",
  "name": "Smartphone",
  "price": 1500,
  "variants": [
    {
      "name": "Color",
      "options": [
        {
          "value": "Red",
          "price": 1500,
          "stock": 10,
          "sku": "PROD-001-RED"
        }
      ]
    }
  ],
  "totalStock": 25,
  "priceRange": { "min": 1500, "max": 1600 },
  "availableVariants": [...]
}
```

## Frontend Integration

### Product Detail Page
- Variant selector displays when product has variants
- Dynamic price and stock updates based on selection
- Variant-specific images
- Add to cart includes selected variants

### Seller Dashboard
- Manage variants button in product actions
- Comprehensive variant management modal
- Real-time updates and validation

## Helper Methods

### Product Model Methods
- `getVariantByCombination(variantCombination)` - Get specific variant
- `getAvailableVariants()` - Get all available combinations
- `getTotalStock()` - Calculate total stock across variants
- `getPriceRange()` - Get min/max prices across variants

## Cart Integration

The cart system has been updated to handle variants:
- Cart items include selected variant information
- Price calculations use variant-specific prices
- Stock validation uses variant-specific stock

## Usage Examples

### For Sellers
1. Create a product with base information
2. Click "Manage Variants" in the seller dashboard
3. Add variant types (e.g., Color, Size)
4. Add variant options with specific prices, stock, and SKUs
5. Upload variant-specific images if needed

### For Customers
1. Browse to a product with variants
2. Select desired variant options
3. See dynamic price and stock updates
4. Add to cart with selected variants

## Benefits

1. **Reduced Product Management**: Single product entry for multiple variants
2. **Better Inventory Control**: Stock tracking per variant
3. **Flexible Pricing**: Different prices for different variants
4. **Enhanced UX**: Dynamic updates and visual feedback
5. **Scalable**: Easy to add new variant types and options

## Future Enhancements

1. **Bulk Operations**: Add/update multiple variants at once
2. **Variant Templates**: Predefined variant combinations
3. **Advanced Pricing**: Tiered pricing based on variants
4. **Variant Analytics**: Track performance per variant
5. **Import/Export**: Bulk variant management via CSV

## Technical Notes

- All variant operations require seller authentication
- SKUs must be unique across the entire system
- Variant images fall back to product images if not specified
- Price calculations handle both base product and variant-specific pricing
- Stock validation prevents overselling specific variants 
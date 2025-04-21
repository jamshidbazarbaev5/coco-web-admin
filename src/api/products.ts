import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

export interface AttributeImage {
  image: File;
  id?: number;
}

export interface ProductAttribute {
  color_code: string;  
  color_name_uz: string;
  color_name_ru: string;
  attribute_images: AttributeImage[];
  sizes: number[];
  price: number;
  new_price?: string;
  quantity: number;
}

export interface ProductFormData {
  id?: number;
  brand: number;
  category: number;
  title_uz: string;
  title_ru: string;
  description_uz: string;
  description_ru: string;
  material: number;
  product_attributes: ProductAttribute[];
  color_code: string;
  color_name_uz: string;
  color_name_ru: string;
}

export interface Product extends Omit<ProductFormData, 'product_attributes'> {
  id?: number;
  product_attributes: Array<{
    id: number;
    color_code: string;
    color_name_uz: string;
    color_name_ru: string;
    price: number;
    new_price?: string;
    quantity: number;
    sizes: number[];
    attribute_images: Array<{
      id: number;
      product: string;
      image: string;
    }>;
  }>;
  created_at?: string;
  color_code: string;
  color_name_uz: string;
  color_name_ru: string;
  updated_at?: string;
  on_sale?: boolean;
  next?: string;
}

// Add this interface for the API response
export interface ProductsResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

const PRODUCT_URL = 'products/crud/product/';

export const {
  useGetResources: useGetProducts,
  useGetResource: useGetProduct,
  useCreateResource: useCreateProduct,
  useUpdateResource: useUpdateProduct,
  useDeleteResource: useDeleteProduct
} = createResourceApiHooks<Product, ProductsResponse>(PRODUCT_URL, 'products');

export const createProductFormData = (productData: ProductFormData): FormData => {
  const formData = new FormData();
  
  // Only append if values are valid (not 0, empty string, or undefined)
  if (productData.id) formData.append('id', productData.id.toString());
  if (productData.brand) formData.append('brand', productData.brand.toString());
  if (productData.category) formData.append('category', productData.category.toString());
  if (productData.title_uz?.trim()) formData.append('title_uz', productData.title_uz);
  if (productData.title_ru?.trim()) formData.append('title_ru', productData.title_ru);
  if (productData.description_uz?.trim()) formData.append('description_uz', productData.description_uz);
  if (productData.description_ru?.trim()) formData.append('description_ru', productData.description_ru);
  if (productData.material) formData.append('material', productData.material.toString());
  
  productData.product_attributes.forEach((attr, index) => {
    // Only include attributes that have at least one required field filled
    const hasRequiredFields = attr.color_code !== '#000000' || 
                            attr.color_name_uz?.trim() || 
                            attr.color_name_ru?.trim() ||
                            attr.price > 0 ||
                            attr.quantity > 0 ||
                            attr.attribute_images.length > 0 ||
                            (attr.sizes && attr.sizes.length > 0);

    if (hasRequiredFields) {
      if (attr.color_code !== '#000000') {
        formData.append(`product_attributes[${index}]color_code`, attr.color_code);
      }
      if (attr.color_name_uz?.trim()) {
        formData.append(`product_attributes[${index}]color_name_uz`, attr.color_name_uz);
      }
      if (attr.color_name_ru?.trim()) {
        formData.append(`product_attributes[${index}]color_name_ru`, attr.color_name_ru);
      }

      // Only append images that exist
      attr.attribute_images.forEach((image, imageIndex) => {
        if (image.image instanceof File) {
          formData.append(`product_attributes[${index}]attribute_images[${imageIndex}]image`, image.image);
        }
        if (image.id) {
          formData.append(`product_attributes[${index}]attribute_images[${imageIndex}]id`, image.id.toString());
        }
      });

      // Only append price if it's greater than 0
      if (attr.price > 0) {
        formData.append(`product_attributes[${index}]price`, attr.price.toString());
      }

      // Only append new_price if it exists and is not empty
      if (attr.new_price?.toString().trim()) {
        formData.append(`product_attributes[${index}]new_price`, attr.new_price.toString());
      }

      // Handle quantity - if it's 0 send it, if empty send as ''
      if (attr.quantity !== undefined) {
        formData.append(
          `product_attributes[${index}]quantity`, 
          attr.quantity === 0 ? '0' : attr.quantity.toString() || ''
        );
      }
      
      // Only append sizes if they exist and array is not empty
      if (attr.sizes && attr.sizes.length > 0) {
        attr.sizes.forEach((sizeId, sizeIndex) => {
          formData.append(`product_attributes[${index}]uploaded_sizes[${sizeIndex}]`, sizeId.toString());
        });
      }
    }
  });
  
  // Log only if there's data to send
  if (Array.from(formData.entries()).length > 0) {
    console.log('Form data being sent:', Object.fromEntries(formData.entries()));
  }
  
  return formData;
};
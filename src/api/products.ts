import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

export interface ProductAttribute {
  color_code: string;  
  color_name_uz: string;
  color_name_ru: string;
  image: File;
  sizes: number[];  // Updated to match the new structure
  price: number;
  new_price?: number;
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
    image: any;
    sizes: number[];
    color_code: string;
    color_name_uz: string;
    color_name_ru: string;
    price: number;
    new_price?: number;
    quantity: number;
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
  
  if (productData.id) formData.append('id', productData.id.toString());
  formData.append('brand', productData.brand.toString());
  formData.append('category', productData.category.toString());
  formData.append('title_uz', productData.title_uz);
  formData.append('title_ru', productData.title_ru);
  formData.append('description_uz', productData.description_uz);
  formData.append('description_ru', productData.description_ru);
  formData.append('material', productData.material.toString());
  
  productData.product_attributes.forEach((attr, index) => {
    formData.append(`product_attributes[${index}]color_code`, attr.color_code);
    formData.append(`product_attributes[${index}]color_name_uz`, attr.color_name_uz);
    formData.append(`product_attributes[${index}]color_name_ru`, attr.color_name_ru);
    formData.append(`product_attributes[${index}]image`, attr.image);
    formData.append(`product_attributes[${index}]price`, attr.price.toString());
    if (attr.new_price) {
      formData.append(`product_attributes[${index}]new_price`, attr.new_price.toString());
    }
    formData.append(`product_attributes[${index}]quantity`, attr.quantity.toString());
    
    if (attr.sizes && attr.sizes.length > 0) {
      attr.sizes.forEach((sizeId, sizeIndex) => {
        formData.append(`product_attributes[${index}]uploaded_sizes[${sizeIndex}]`, sizeId.toString());
      });
    }
  });
  
  console.log('Form data being sent:', Object.fromEntries(formData.entries()));
  
  return formData;
};
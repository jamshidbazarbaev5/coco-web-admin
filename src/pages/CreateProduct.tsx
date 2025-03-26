import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../helpers/ProductForm';
import { useCreateProduct, createProductFormData } from '../api/products';
import api from '../api/api';
import { useState, useEffect } from 'react';

export function CreateProduct() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };

  // State to store all fetched data
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allSizes, setAllSizes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchAllPages = async (initialUrl: string) => {
    let results: any[] = [];
    let nextUrl: string | null = initialUrl;
    
    while (nextUrl) {
      const response = await api.get(nextUrl);
      const data = response.data as PaginatedResponse<any>;
      
      const resultsWithIds = data.results.map((item, index) => {
        if (!item.hasOwnProperty('id')) {
          console.warn(`Item in ${initialUrl} is missing id property:`, item);
          return { ...item, id: item.id || index + 1 };
        }
        return item;
      });
      
      results = [...results, ...resultsWithIds];
      nextUrl = data.next ? data.next.replace(api.defaults.baseURL || '', '') : null;
    }
    
    return results;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        const [brands, categories, materials, sizes] = await Promise.all([
          fetchAllPages('/brands/crud/brand/'),
          fetchAllPages('/brands/crud/category/'),
          fetchAllPages('/products/crud/material/'),
          fetchAllPages('/products/crud/size/')
        ]);
        
        console.log('All brands:', brands);
        console.log('All categories:', categories);
        console.log('All materials:', materials);
        console.log('All sizes:', sizes);
        
        const transformedBrands = brands.map(brand => ({
          id: brand.id,
          name_uz: brand.name,
          name_ru: brand.name
        }));
        
        const transformedCategories = categories.map(category => ({
          id: category.id,
          name_uz: category.name || category.name_uz,
          name_ru: category.name || category.name_ru
        }));
        
        const transformedMaterials = materials.map(material => ({
          id: material.id,
          name_uz: material.name || material.name_uz,
          name_ru: material.name || material.name_ru
        }));
        
        const transformedSizes = sizes.map(size => ({
          id: size.id,
          name_uz: size.name,
          name_ru: size.name
        }));
        
        // Set the transformed data
        setAllBrands(transformedBrands);
        setAllCategories(transformedCategories);
        setAllMaterials(transformedMaterials);
        setAllSizes(transformedSizes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  if (isLoading || !allBrands.length || !allCategories.length || !allMaterials.length || !allSizes.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
      <ProductForm
        onSubmit={async (data) => {
          try {
            console.log('Submitting form data:', data);
            const formData = createProductFormData(data);
            await createProduct.mutateAsync(formData as any);
            navigate('/products');
          } catch (error) {
            console.error('Failed to create product:', error);
          }
        }}
        isSubmitting={createProduct.isPending}
        brands={allBrands}
        categories={allCategories}
        materials={allMaterials}
        sizes={allSizes}
        defaultValues={{
          brand: 0,
          category: 0,
          title_uz: '',
          title_ru: '',
          description_uz: '',
          description_ru: '',
          material: 0,
          price: 0,
          quantity: 0,
          new_price: 0,
          product_attributes: [{
            color_code: '#000000',
            color_name_uz: '',
            color_name_ru: '',
            image: new File([], 'placeholder.jpg'),
            sizes: []
          }]
        }}
      />
    </div>
  );
}
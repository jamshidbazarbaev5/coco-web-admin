import { useNavigate, useParams } from 'react-router-dom';
import { useGetProduct } from '../api/products';
import api from '../api/api';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusIcon, TrashIcon } from 'lucide-react';

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading } = useGetProduct(Number(id));
  
  // State to store all fetched data
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [allSizes, setAllSizes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<any>({});
  const [productAttributes, setProductAttributes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setAttributesModified] = useState(false);
  const [deletedAttributes, setDeletedAttributes] = useState<number[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);

  const fetchAllPages = async (initialUrl: string) => {
    let results: any[] = [];
    let nextUrl: string | null = initialUrl;
    
    while (nextUrl) {
      const response: any = await api.get(nextUrl);
      const data = response.data;
      
      const resultsWithIds = data.results.map((item: any, index: number) => {
        if (!item.hasOwnProperty('id')) {
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
        
        // Transform the fetched data to match the expected structure
        const transformedBrands = brands.map(brand => ({
          id: brand.id,
          name_uz: brand.name || brand.name_uz,
          name_ru: brand.name || brand.name_ru
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
        
        // Transform sizes to match the new structure
        const transformedSizes = sizes.map(size => ({
          id: size.id,
          name_uz: size.name_uz,
          name_ru: size.name_ru
        }));
        
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

  useEffect(() => {
    if (product) {
      setFormData({
        brand: product.brand,
        category: product.category,
        material: product.material,
        title_uz: product.title_uz,
        title_ru: product.title_ru,
        description_uz: product.description_uz,
        description_ru: product.description_ru
      });
      
      if (product.product_attributes && product.product_attributes.length > 0) {
        setProductAttributes(
          product.product_attributes.map(attr => ({
            id: attr.id,
            color_code: attr.color_code || '#000000',
            color_name_uz: attr.color_name_uz || '',
            color_name_ru: attr.color_name_ru || '',
            attribute_images: attr.attribute_images || [],
            sizes: attr.sizes || [],
            price: attr.price || 0,
            new_price: attr.new_price || '',
            quantity: attr.quantity || 0,
          }))
        );
      } else {
        setProductAttributes([{
          color_code: '#000000',
          color_name_uz: '',
          color_name_ru: '',
          attribute_images: [],
          sizes: [],
          price: 0,
          new_price: '',
          quantity: 0,
        }]);
      }
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any)  => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (index: number, field: string, value: any) => {
    setAttributesModified(true);
    setProductAttributes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addAttribute = () => {
    setAttributesModified(true);
    setProductAttributes(prev => [...prev, {
      color_code: '#000000',
      color_name_uz: '',
      color_name_ru: '',
      attribute_images: [],
      sizes: [],
      price: 0,
      new_price: '',
      quantity: 0,
    }]);
  };

  const removeAttribute = (index: number) => {
    setAttributesModified(true);
    const attribute = productAttributes[index];
    
    // If the attribute has an ID (existing attribute), add it to deletedAttributes
    if (attribute.id) {
      setDeletedAttributes(prev => [...prev, attribute.id]);
    }
    
    setProductAttributes(prev => prev.filter((_, i) => i !== index));
  };

  // Add function to handle image deletion
  const handleImageDelete = (attrIndex: number, imageId: number) => {
    setAttributesModified(true);
    setDeletedImages(prev => [...prev, imageId]);
    
    setProductAttributes(prev => {
      const updated = [...prev];
      updated[attrIndex] = {
        ...updated[attrIndex],
        attribute_images: updated[attrIndex].attribute_images.filter((img: any) => img.id !== imageId)
      };
      return updated;
    });
  };

  // Add function to handle image addition
  const handleImageAdd = (attrIndex: number, files: FileList | null) => {
    if (!files) return;
    
    setAttributesModified(true);
    setProductAttributes(prev => {
      const updated = [...prev];
      const newImages = Array.from(files).map(file => ({
        image: file,
        isNew: true
      }));
      
      updated[attrIndex] = {
        ...updated[attrIndex],
        attribute_images: [...updated[attrIndex].attribute_images, ...newImages]
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitFormData = new FormData();
      
      // Basic product information
      submitFormData.append('id', id!.toString());
      submitFormData.append('brand', formData.brand.toString());
      submitFormData.append('category', formData.category.toString());
      submitFormData.append('title_uz', formData.title_uz);
      submitFormData.append('title_ru', formData.title_ru);
      submitFormData.append('description_uz', formData.description_uz);
      submitFormData.append('description_ru', formData.description_ru);
      submitFormData.append('material', formData.material.toString());

      // Add deleted attributes and images to form data
      deletedAttributes.forEach((id, index) => {
        submitFormData.append(`attributes_to_delete[${index}]`, id.toString());
      });

      deletedImages.forEach((id, index) => {
        submitFormData.append(`images_to_delete[${index}]`, id.toString());
      });

      // Product attributes
      productAttributes.forEach((attr, index) => {
        if (attr.id) {
          submitFormData.append(`product_attributes[${index}]id`, attr.id.toString());
        }
        
        submitFormData.append(`product_attributes[${index}]color_code`, attr.color_code || '#000000');
        submitFormData.append(`product_attributes[${index}]color_name_uz`, attr.color_name_uz || '');
        submitFormData.append(`product_attributes[${index}]color_name_ru`, attr.color_name_ru || '');
        submitFormData.append(`product_attributes[${index}]price`, attr.price.toString());
        submitFormData.append(`product_attributes[${index}]quantity`, attr.quantity.toString());
        
        // Modified new_price handling
        submitFormData.append(`product_attributes[${index}]new_price`, attr.new_price || '');

        // Handle deleted images for this attribute
        const deletedImagesForAttr = deletedImages.filter(imageId => {
          const image = product?.product_attributes[index]?.attribute_images?.find((img: any) => img.id === imageId);
          return !!image;
        });

        deletedImagesForAttr.forEach((imageId, imgIndex) => {
          submitFormData.append(
            `product_attributes[${index}]images_to_delete[${imgIndex}]`,
            imageId.toString()
          );
        });
        
        // Handle new images
        const newImages = attr.attribute_images.filter((img: any) => img.isNew && img.image instanceof File);
        newImages.forEach((img: any, imgIndex: number) => {
          submitFormData.append(
            `product_attributes[${index}]attribute_images[${imgIndex}]image`,
            img.image
          );
        });
        
        if (attr.sizes && attr.sizes.length > 0) {
          attr.sizes.forEach((sizeId: number, sizeIndex: number) => {
            submitFormData.append(
              `product_attributes[${index}]uploaded_sizes[${sizeIndex}]`, 
              sizeId.toString()
            );
          });
        }
      });

      console.log('Submitting form data:', Object.fromEntries(submitFormData.entries()));
      
      await api.put(`/products/crud/product/${id}/`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDeletedAttributes([]);
      setDeletedImages([]);
      navigate('/products');
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading || productLoading || !product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Редактировать товар</h1>
        <Button variant="outline" onClick={() => navigate('/products')}>
          Назад к товарам
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="basic">Основная информация</TabsTrigger>
            <TabsTrigger value="details">Детали товара</TabsTrigger>
            <TabsTrigger value="attributes">Атрибуты и варианты</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card className="border-0 shadow-none">
              <CardHeader className="border-0">
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Бренд</Label>
                    <Select 
                      value={formData.brand?.toString()} 
                      onValueChange={(value) => handleSelectChange('brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите бренд" />
                      </SelectTrigger>
                      <SelectContent>
                        {allBrands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select 
                      value={formData.category?.toString()} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="material">Материал</Label>
                    <Select 
                      value={formData.material?.toString()} 
                      onValueChange={(value) => handleSelectChange('material', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите материал" />
                      </SelectTrigger>
                      <SelectContent>
                        {allMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id.toString()}>
                            {material.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Product Details Tab */}
          <TabsContent value="details">
            <Card className="border-0 shadow-none">
              <CardHeader className="border-0">
                <CardTitle>Детали товара</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title_uz">Название (UZ)</Label>
                    <Input 
                      id="title_uz" 
                      name="title_uz" 
                      value={formData.title_uz || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title_ru">Название (RU)</Label>
                    <Input 
                      id="title_ru" 
                      name="title_ru" 
                      value={formData.title_ru || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="description_uz">Описание (UZ)</Label>
                    <Textarea 
                      id="description_uz" 
                      name="description_uz" 
                      value={formData.description_uz || ''} 
                      onChange={handleInputChange} 
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description_ru">Описание (RU)</Label>
                    <Textarea 
                      id="description_ru" 
                      name="description_ru" 
                      value={formData.description_ru || ''} 
                      onChange={handleInputChange} 
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Attributes Tab */}
          <TabsContent value="attributes">
            <Card className="border-0 shadow-none">
              <CardHeader className="border-0 flex flex-row items-center justify-between">
                <CardTitle>Атрибуты и варианты товара</CardTitle>
                <Button 
                  type="button" 
                  onClick={addAttribute} 
                  variant="outline" 
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Добавить вариант
                </Button>
              </CardHeader>
              <CardContent>
                {productAttributes.map((attr, index) => (
                  <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Вариант {index + 1}</h3>
                      <Button 
                        type="button" 
                        onClick={() => removeAttribute(index)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`color-${index}`}>Цвет</Label>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2">
                            <Input 
                              id={`color-${index}`} 
                              type="color" 
                              value={attr.color_code || '#000000'} 
                              onChange={(e) => handleAttributeChange(index, 'color_code', e.target.value)} 
                              className="w-12 h-10 p-1"
                            />
                            <Input 
                              value={attr.color_code || '#000000'} 
                              onChange={(e) => {
                                // Ensure the value starts with #
                                let value = e.target.value;
                                if (!value.startsWith('#')) {
                                  value = '#' + value;
                                }
                                // Limit to 7 characters (#RRGGBB)
                                value = value.slice(0, 7);
                                handleAttributeChange(index, 'color_code', value);
                              }}
                              className="flex-1"
                              placeholder="#000000"
                            />
                          </div>
                          <Input 
                            placeholder="Color name (UZ)"
                            value={attr.color_name_uz || ''}
                            onChange={(e) => handleAttributeChange(index, 'color_name_uz', e.target.value)}
                          />
                          <Input 
                            placeholder="Color name (RU)"
                            value={attr.color_name_ru || ''}
                            onChange={(e) => handleAttributeChange(index, 'color_name_ru', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`sizes-${index}`}>Размеры</Label>
                        <div className="space-y-2 bg-white p-2 rounded max-h-40 overflow-y-auto">
                          {allSizes.map((size) => (
                            <div key={size.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`size-${index}-${size.id}`}
                                checked={attr.sizes?.includes(size.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const currentSizes = attr.sizes || [];
                                  const updatedSizes = checked
                                    ? [...currentSizes, size.id]
                                    : currentSizes.filter((id: number) => id !== size.id);
                                  handleAttributeChange(index, 'sizes', updatedSizes);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor={`size-${index}-${size.id}`} className="text-sm font-medium">
                                {size.name_uz}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`image-${index}`}>
                          Изображение <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageAdd(index, e.target.files)}
                          className="bg-white w-full"
                        />

                        {/* Image Preview Grid */}
                        {attr.attribute_images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                            {attr.attribute_images.map((img: any, imgIndex: number) => (
                              <div key={img.id || imgIndex} className="relative group">
                                <div className="aspect-square rounded-lg border overflow-hidden bg-white">
                                  {img.isNew ? (
                                    <img 
                                      src={URL.createObjectURL(img.image)}
                                      alt={`Preview ${imgIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                  ) : (
                                    <img 
                                      src={img.image}
                                      alt={`Product ${imgIndex + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => img.id ? handleImageDelete(index, img.id) : setProductAttributes(prev => {
                                    const updated = [...prev];
                                    updated[index].attribute_images = updated[index].attribute_images.filter((_: any, i: number) => i !== imgIndex);
                                    return updated;
                                  })}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`price-${index}`}>Цена</Label>
                          <Input
                            id={`price-${index}`}
                            type="number"
                            value={attr.price || ''}
                            onChange={(e) => handleAttributeChange(index, 'price', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`new-price-${index}`}>Цена со скидкой</Label>
                          <Input
                            id={`new-price-${index}`}
                            type="number"
                            value={attr.new_price || ''}
                            onChange={(e) => handleAttributeChange(index, 'new_price', e.target.value)}
                            placeholder="Оставьте пустым, если нет скидки"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`quantity-${index}`}>Количество</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            value={attr.quantity || ''}
                            onChange={(e) => handleAttributeChange(index, 'quantity', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {productAttributes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Вариантов пока нет. Нажмите "Добавить вариант" чтобы создать.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/products')}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить товар'}
          </Button>
        </div>
      </form>
    </div>
  );
}
// import { useNavigate, useParams } from 'react-router-dom';
// import { useGetProduct } from '../api/products';
// import api from '../api/api';
// import { useState, useEffect } from 'react';
// import { Button } from '../components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Input } from '../components/ui/input';
// import { Textarea } from '../components/ui/textarea';
// import { Label } from '../components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
// import { PlusIcon, TrashIcon } from 'lucide-react';

// export function EditProduct() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { data: product, isLoading: productLoading } = useGetProduct(Number(id));
  
//   // State to store all fetched data
//   const [allBrands, setAllBrands] = useState<any[]>([]);
//   const [allCategories, setAllCategories] = useState<any[]>([]);
//   const [allMaterials, setAllMaterials] = useState<any[]>([]);
//   const [allSizes, setAllSizes] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   const [formData, setFormData] = useState<any>({});
//   const [productAttributes, setProductAttributes] = useState<any[]>([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [, setAttributesModified] = useState(false);

//   const fetchAllPages = async (initialUrl: string) => {
//     let results: any[] = [];
//     let nextUrl: string | null = initialUrl;
    
//     while (nextUrl) {
//       const response: any = await api.get(nextUrl);
//       const data = response.data;
      
//       const resultsWithIds = data.results.map((item: any, index: number) => {
//         if (!item.hasOwnProperty('id')) {
//           return { ...item, id: item.id || index + 1 };
//         }
//         return item;
//       });
      
//       results = [...results, ...resultsWithIds];
//       nextUrl = data.next ? data.next.replace(api.defaults.baseURL || '', '') : null;
//     }
    
//     return results;
//   };

//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setIsLoading(true);
        
//         const [brands, categories, materials, sizes] = await Promise.all([
//           fetchAllPages('/brands/crud/brand/'),
//           fetchAllPages('/brands/crud/category/'),
//           fetchAllPages('/products/crud/material/'),
//           fetchAllPages('/products/crud/size/')
//         ]);
        
//         setAllBrands(brands);
//         setAllCategories(categories);
//         setAllMaterials(materials);
//         setAllSizes(sizes);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchAllData();
//   }, []);

//   useEffect(() => {
//     if (product) {
//       setFormData({
//         brand: product.brand,
//         category: product.category,
//         material: product.material,
//         title_uz: product.title_uz,
//         title_ru: product.title_ru,
//         description_uz: product.description_uz,
//         description_ru: product.description_ru,
//         price: product.price,
//         new_price: product.new_price || '',
//         quantity: product.quantity
//       });
      
//       if (product.product_attributes && product.product_attributes.length > 0) {
//         setProductAttributes(
//           product.product_attributes.map(attr => ({
//             id: attr.id,
//             color_code: attr.color_code || '#000000',
//             color_name_uz: attr.color_name_uz || '',
//             color_name_ru: attr.color_name_ru || '',
//             image: attr.image,
//             sizes: attr.sizes,
//             newImage: null
//           }))
//         );
//       } else {
//         setProductAttributes([{
//           color_code: '#000000',
//           color_name_uz: '',
//           color_name_ru: '',
//           sizes: [],
//           newImage: null
//         }]);
//       }
//     }
//   }, [product]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev: any)  => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData((prev: any) => ({ ...prev, [name]: value }));
//   };

//   const handleAttributeChange = (index: number, field: string, value: any) => {
//     setAttributesModified(true);
//     setProductAttributes(prev => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   };

//   const addAttribute = () => {
//     setAttributesModified(true);
//     setProductAttributes(prev => [...prev, {
//       color_code: '#000000',
//       color_name_uz: '',
//       color_name_ru: '',
//       sizes: [],
//       image: null,
//       newImage: null
//     }]);
//   };

//   const removeAttribute = (index: number) => {
//     setAttributesModified(true);
//     setProductAttributes(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       const submitFormData = new FormData();
      
//       // Basic product information
//       submitFormData.append('id', id!.toString());
//       submitFormData.append('brand', formData.brand.toString());
//       submitFormData.append('category', formData.category.toString());
//       submitFormData.append('title_uz', formData.title_uz);
//       submitFormData.append('title_ru', formData.title_ru);
//       submitFormData.append('description_uz', formData.description_uz);
//       submitFormData.append('description_ru', formData.description_ru);
//       submitFormData.append('material', formData.material.toString());
//       submitFormData.append('price', formData.price.toString());
//       submitFormData.append('quantity', formData.quantity.toString());
//       if (formData.new_price) {
//         submitFormData.append('new_price', formData.new_price.toString());
//       }

//       // Product attributes
//       await Promise.all(productAttributes.map(async (attr, index) => {
//         // Include ID for existing attributes
//         if (attr.id) {
//           submitFormData.append(`product_attributes[${index}]id`, attr.id.toString());
//         }
        
//         // Always include these fields
//         submitFormData.append(`product_attributes[${index}]color_code`, attr.color_code || '#000000');
//         submitFormData.append(`product_attributes[${index}]color_name_uz`, attr.color_name_uz || '');
//         submitFormData.append(`product_attributes[${index}]color_name_ru`, attr.color_name_ru || '');
        
//         // Handle image field:
//         // If there's a new image, use that
//         // Otherwise, if there's an existing image URL, create a file from it
//         if (attr.newImage instanceof File) {
//           submitFormData.append(`product_attributes[${index}]image`, attr.newImage);
//         } else if (attr.image) {
//           // Convert the image URL to a file
//           try {
//             const response = await fetch(attr.image);
//             const blob = await response.blob();
//             const file = new File([blob], 'existing-image.jpg', { type: 'image/jpeg' });
//             submitFormData.append(`product_attributes[${index}]image`, file);
//           } catch (error) {
//             console.error('Error converting image URL to file:', error);
//           }
//         }
        
//         // Handle sizes
//         if (attr.sizes && attr.sizes.length > 0) {
//           attr.sizes.forEach((sizeId: number, sizeIndex: number) => {
//             submitFormData.append(
//               `product_attributes[${index}]uploaded_sizes[${sizeIndex}]`, 
//               sizeId.toString()
//             );
//           });
//         }
//       }));

//       console.log('Submitting form data:', Object.fromEntries(submitFormData.entries()));
      
//       // Make the API request
//       await api.put(`/products/crud/product/${id}/`, submitFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       navigate('/products');
//     } catch (error) {
//       console.error('Failed to update product:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


//   if (isLoading || productLoading || !product) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-6 px-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Edit Product</h1>
//         <Button variant="outline" onClick={() => navigate('/products')}>
//           Back to Products
//         </Button>
//       </div>
      
//       <form onSubmit={handleSubmit}>
//         <Tabs defaultValue="basic" className="w-full">
//           <TabsList className="grid w-full grid-cols-3 mb-6">
//             <TabsTrigger value="basic">Basic Information</TabsTrigger>
//             <TabsTrigger value="details">Product Details</TabsTrigger>
//             <TabsTrigger value="attributes">Attributes & Variants</TabsTrigger>
//           </TabsList>
          
//           {/* Basic Information Tab */}
//           <TabsContent value="basic">
//             <Card className="border-0 shadow-none">
//               <CardHeader className="border-0">
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Brand */}
//                   <div className="space-y-2">
//                     <Label htmlFor="brand">Brand</Label>
//                     <Select 
//                       value={formData.brand?.toString()} 
//                       onValueChange={(value) => handleSelectChange('brand', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select brand" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {allBrands.map((brand) => (
//                           <SelectItem key={brand.id} value={brand.id.toString()}>
//                             {brand.name || brand.name_uz}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   {/* Category */}
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select 
//                       value={formData.category?.toString()} 
//                       onValueChange={(value) => handleSelectChange('category', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {allCategories.map((category) => (
//                           <SelectItem key={category.id} value={category.id.toString()}>
//                             {category.name || category.name_uz}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   {/* Material */}
//                   <div className="space-y-2">
//                     <Label htmlFor="material">Material</Label>
//                     <Select 
//                       value={formData.material?.toString()} 
//                       onValueChange={(value) => handleSelectChange('material', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select material" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {allMaterials.map((material) => (
//                           <SelectItem key={material.id} value={material.id.toString()}>
//                             {material.name || material.name_uz}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
          
//           {/* Product Details Tab */}
//           <TabsContent value="details">
//             <Card className="border-0 shadow-none">
//               <CardHeader className="border-0">
//                 <CardTitle>Product Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Title UZ */}
//                   <div className="space-y-2">
//                     <Label htmlFor="title_uz">Title (UZ)</Label>
//                     <Input 
//                       id="title_uz" 
//                       name="title_uz" 
//                       value={formData.title_uz || ''} 
//                       onChange={handleInputChange} 
//                     />
//                   </div>
                  
//                   {/* Title RU */}
//                   <div className="space-y-2">
//                     <Label htmlFor="title_ru">Title (RU)</Label>
//                     <Input 
//                       id="title_ru" 
//                       name="title_ru" 
//                       value={formData.title_ru || ''} 
//                       onChange={handleInputChange} 
//                     />
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Description UZ */}
//                   <div className="space-y-2">
//                     <Label htmlFor="description_uz">Description (UZ)</Label>
//                     <Textarea 
//                       id="description_uz" 
//                       name="description_uz" 
//                       value={formData.description_uz || ''} 
//                       onChange={handleInputChange} 
//                       rows={4}
//                     />
//                   </div>
                  
//                   {/* Description RU */}
//                   <div className="space-y-2">
//                     <Label htmlFor="description_ru">Description (RU)</Label>
//                     <Textarea 
//                       id="description_ru" 
//                       name="description_ru" 
//                       value={formData.description_ru || ''} 
//                       onChange={handleInputChange} 
//                       rows={4}
//                     />
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Price */}
//                   <div className="space-y-2">
//                     <Label htmlFor="price">Price</Label>
//                     <Input 
//                       id="price" 
//                       name="price" 
//                       type="number" 
//                       value={formData.price || ''} 
//                       onChange={handleInputChange} 
//                     />
//                   </div>
                  
//                   {/* New Price */}
//                   <div className="space-y-2">
//                     <Label htmlFor="new_price">Sale Price</Label>
//                     <Input 
//                       id="new_price" 
//                       name="new_price" 
//                       type="number" 
//                       value={formData.new_price || ''} 
//                       onChange={handleInputChange} 
//                       placeholder="Leave empty if no sale"
//                     />
//                   </div>
                  
//                   {/* Quantity */}
//                   <div className="space-y-2">
//                     <Label htmlFor="quantity">Quantity</Label>
//                     <Input 
//                       id="quantity" 
//                       name="quantity" 
//                       type="number" 
//                       value={formData.quantity || ''} 
//                       onChange={handleInputChange} 
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
          
//           {/* Attributes Tab */}
//           <TabsContent value="attributes">
//             <Card className="border-0 shadow-none">
//               <CardHeader className="border-0 flex flex-row items-center justify-between">
//                 <CardTitle>Product Attributes & Variants</CardTitle>
//                 <Button 
//                   type="button" 
//                   onClick={addAttribute} 
//                   variant="outline" 
//                   size="sm"
//                 >
//                   <PlusIcon className="h-4 w-4 mr-2" /> Add Variant
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 {productAttributes.map((attr, index) => (
//                   <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="font-medium">Variant {index + 1}</h3>
//                       <Button 
//                         type="button" 
//                         onClick={() => removeAttribute(index)} 
//                         variant="ghost" 
//                         size="sm"
//                       >
//                         <TrashIcon className="h-4 w-4 text-red-500" />
//                       </Button>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                       {/* Color Section */}
//                       <div className="space-y-2">
//                         <Label htmlFor={`color-${index}`}>Color</Label>
//                         <div className="flex flex-col gap-4">
//                           <div className="flex items-center gap-2">
//                             <Input 
//                               id={`color-${index}`} 
//                               type="color" 
//                               value={attr.color_code || '#000000'} 
//                               onChange={(e) => handleAttributeChange(index, 'color_code', e.target.value)} 
//                               className="w-12 h-10 p-1"
//                             />
//                             <Input 
//                               value={attr.color_code || '#000000'} 
//                               onChange={(e) => {
//                                 // Ensure the value starts with #
//                                 let value = e.target.value;
//                                 if (!value.startsWith('#')) {
//                                   value = '#' + value;
//                                 }
//                                 // Limit to 7 characters (#RRGGBB)
//                                 value = value.slice(0, 7);
//                                 handleAttributeChange(index, 'color_code', value);
//                               }}
//                               className="flex-1"
//                               placeholder="#000000"
//                             />
//                           </div>
//                           <Input 
//                             placeholder="Color name (UZ)"
//                             value={attr.color_name_uz || ''}
//                             onChange={(e) => handleAttributeChange(index, 'color_name_uz', e.target.value)}
//                           />
//                           <Input 
//                             placeholder="Color name (RU)"
//                             value={attr.color_name_ru || ''}
//                             onChange={(e) => handleAttributeChange(index, 'color_name_ru', e.target.value)}
//                           />
//                         </div>
//                       </div>
                      
//                       {/* Sizes */}
//                       <div className="space-y-2">
//                         <Label htmlFor={`sizes-${index}`}>Sizes</Label>
//                         <div className="space-y-2 bg-white p-2 rounded max-h-40 overflow-y-auto">
//                           {allSizes.map((size) => (
//                             <div key={size.id} className="flex items-center space-x-2">
//                               <input
//                                 type="checkbox"
//                                 id={`size-${index}-${size.id}`}
//                                 checked={attr.sizes?.includes(size.id)}
//                                 onChange={(e) => {
//                                   const checked = e.target.checked;
//                                   const currentSizes = attr.sizes || [];
//                                   const updatedSizes = checked
//                                     ? [...currentSizes, size.id]
//                                     : currentSizes.filter((id: number) => id !== size.id);
//                                   handleAttributeChange(index, 'sizes', updatedSizes);
//                                 }}
//                                 className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//                               />
//                               <label htmlFor={`size-${index}-${size.id}`} className="text-sm font-medium">
//                                 {size.name || size.name_uz}
//                               </label>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
                      
//                       {/* Image */}
//                       <div className="space-y-2">
//                         <Label htmlFor={`image-${index}`}>
//                           Image <span className="text-red-500">*</span>
//                         </Label>
//                         {attr.image && !attr.newImage && (
//                           <div className="mb-2">
//                             <img 
//                               src={attr.image} 
//                               alt={`Variant ${index + 1}`} 
//                               className="h-20 w-20 object-cover rounded-md"
//                             />
//                           </div>
//                         )}
//                         <Input 
//                           id={`image-${index}`} 
//                           type="file" 
//                           accept="image/*"
//                           required={!attr.image}
//                           onChange={(e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               handleAttributeChange(index, 'newImage', file);
//                             }
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
                
//                 {productAttributes.length === 0 && (
//                   <div className="text-center py-8 text-gray-500">
//                     No variants added yet. Click "Add Variant" to create one.
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
        
//         <div className="mt-6 flex justify-end gap-4">
//           <Button 
//             type="button" 
//             variant="outline" 
//             onClick={() => navigate('/products')}
//           >
//             Cancel
//           </Button>
//           <Button 
//             type="submit" 
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'Saving...' : 'Save Product'}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }   
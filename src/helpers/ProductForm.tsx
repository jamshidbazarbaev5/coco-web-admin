import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ProductFormData, Product } from '../api/products';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  defaultValues?: Partial<Product>;
  isSubmitting?: boolean;
  brands: Array<{ id: number; name_uz: string; name_ru: string }>;
  categories: Array<{ id: number; name_uz: string; name_ru: string }>;
  materials: Array<{ id: number; name_uz: string; name_ru: string }>;
  sizes: Array<{ id: number; name_uz: string; name_ru: string }>;
}

const productSchema = z.object({
  brand: z.coerce.number().min(1, 'Brand is required'),
  category: z.coerce.number().min(1, 'Category is required'),
  title_uz: z.string().min(1, 'Title (UZ) is required'),
  title_ru: z.string().min(1, 'Title (RU) is required'),
  description_uz: z.string().min(1, 'Description (UZ) is required'),
  description_ru: z.string().min(1, 'Description (RU) is required'),
  material: z.coerce.number().min(1, 'Material is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  quantity: z.coerce.number().min(0, 'Quantity must be positive'),
  new_price: z.coerce.number().min(0, 'New price must be positive').optional(),
  product_attributes: z.array(z.object({
    color: z.string().min(1, 'Color is required'),
    image: z.union([
      z.instanceof(File),
      z.string() // Allow string for existing image URLs
    ]),
    size: z.coerce.number().min(1, 'Size is required'),
  })).min(1, 'At least one product attribute is required'),
});

// Define the type from the schema to ensure they match
type ProductFormSchema = z.infer<typeof productSchema>;

export function ProductForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
  brands,
  categories,
  materials,
  sizes,
}: ProductFormProps) {
  console.log('A. ProductForm received defaultValues:', defaultValues);

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      brand: defaultValues?.brand,
      category: defaultValues?.category,
      title_uz: defaultValues?.title_uz,
      title_ru: defaultValues?.title_ru,
      description_uz: defaultValues?.description_uz,
      description_ru: defaultValues?.description_ru,
      material: defaultValues?.material,
      price: defaultValues?.price,
      quantity: defaultValues?.quantity,
      new_price: defaultValues?.new_price,
      product_attributes: defaultValues?.product_attributes 
        ? defaultValues.product_attributes.map(attr => ({
            color: attr.color,
            size: attr.sizes[0], // Take the first size from the array
            image: attr.image // Use the image URL
          }))
        : [{ color: '', image: new File([], 'placeholder.jpg'), size: 0 }],
    },
  });

  console.log('C. Form initialized with values:', form.getValues());

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'product_attributes',
  });

  const validateAndSubmit = async (data: ProductFormSchema) => {
    console.log('D. ValidateAndSubmit received data:', data);
    
    const hasInvalidImage = data.product_attributes.some(
      attr => {
        const isInvalid = !(attr.image instanceof File || typeof attr.image === 'string');
        console.log('E. Checking image validity:', { attr, isInvalid });
        return isInvalid;
      }
    );
    
    if (hasInvalidImage) {
      console.log('F. Invalid image found');
      form.setError('product_attributes', {
        type: 'manual',
        message: 'All product attributes must have an image'
      });
      return;
    }
    
    // Convert the data to match ProductFormData interface
    const formData: ProductFormData = {
      ...data,
      id: defaultValues?.id, // Make sure to include the ID
      product_attributes: data.product_attributes.map(attr => ({
        color: attr.color,
        // Only create new File if it's not already a string (existing image URL)
        image: typeof attr.image === 'string' ? new File([], attr.image) : attr.image,
        size: attr.size
      }))
    };
    
    console.log('G. Calling onSubmit with formData:', formData);
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(validateAndSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={String(brand.id)}>
                          {brand.name_uz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    defaultValue={undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name_uz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={String(material.id)}>
                          {material.name_uz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Translations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title_uz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (UZ)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_uz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (UZ)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (RU)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_ru"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (RU)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Add new price field after price */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="new_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Price (Sale Price)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Если добавите новую цену, то это будет распродажа" 
                    {...field} 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Attributes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Product Attributes</h3>
            <Button
              type="button"
              onClick={() => append({ color: '', image: new File([], 'placeholder.jpg'), size: 0 })}
              variant="outline"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Add Attribute
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start border p-4 rounded-lg">
              <FormField
                control={form.control}
                name={`product_attributes.${index}.color`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input {...field} type="color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`product_attributes.${index}.size`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Size</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size.id} value={String(size.id)}>
                            {size.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`product_attributes.${index}.image`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Image</FormLabel>
                    {typeof field.value === 'string' && (
                      <div className="mb-2">
                        <img 
                          src={field.value} 
                          alt="Product" 
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                className="mt-8"
                onClick={() => remove(index)}
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* Display form-level errors for product attributes */}
        {form.formState.errors.product_attributes?.message && (
          <div className="text-red-500 text-sm">
            {form.formState.errors.product_attributes.message}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
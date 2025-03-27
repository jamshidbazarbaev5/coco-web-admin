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
  brand: z.coerce.number().min(1, 'Бренд обязателен'),
  category: z.coerce.number().min(1, 'Категория обязательна'),
  title_uz: z.string().min(1, 'Название (UZ) обязательно'),
  title_ru: z.string().min(1, 'Название (RU) обязательно'),
  description_uz: z.string().min(1, 'Описание (UZ) обязательно'),
  description_ru: z.string().min(1, 'Описание (RU) обязательно'),
  material: z.coerce.number().min(1, 'Материал обязателен'),
  product_attributes: z.array(z.object({
    color_code: z.string().min(1, 'Код цвета обязателен'),
    color_name_uz: z.string().min(1, 'Название цвета (UZ) обязательно'),
    color_name_ru: z.string().min(1, 'Название цвета (RU) обязательно'),
    image: z.union([
      z.instanceof(File),
      z.string()
    ]),
    sizes: z.array(z.coerce.number()).min(1, 'Выберите хотя бы один размер'),
    price: z.coerce.number().min(0, 'Цена должна быть положительной'),
    new_price: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().min(0, 'Количество должно быть положительным'),
  })).min(1, 'Добавьте хотя бы один атрибут продукта'),
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
      brand: 0,
      category: 0,
      title_uz: '',
      title_ru: '',
      description_uz: '',
      description_ru: '',
      material: 0,
      product_attributes: [{
        color_code: '#000000',
        color_name_uz: '',
        color_name_ru: '',
        image: new File([], 'placeholder.jpg'),
        sizes: [],
        price: 0,
        new_price: 0,
        quantity: 0
      }],
      ...defaultValues
    },
  });

  console.log('C. Form initialized with values:', form.getValues());
  console.log('Form errors:', form.formState.errors); // Add this line to debug validation errors

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'product_attributes',
  });

  const validateAndSubmit = async (data: ProductFormSchema) => {
    console.log('D. ValidateAndSubmit received data:', data);
    
    try {
      const formData: ProductFormData = {
        ...data,
        id: defaultValues?.id,
        color_code: data.product_attributes[0]?.color_code || '',
        color_name_uz: data.product_attributes[0]?.color_name_uz || '',
        color_name_ru: data.product_attributes[0]?.color_name_ru || '',
        product_attributes: data.product_attributes.map(attr => ({
          color_code: attr.color_code,
          color_name_uz: attr.color_name_uz,
          color_name_ru: attr.color_name_ru,
          image: typeof attr.image === 'string' ? new File([], attr.image) : attr.image,
          sizes: attr.sizes,
          price: attr.price,
          new_price: attr.new_price,
          quantity: attr.quantity
        }))
      };
      
      console.log('G. Calling onSubmit with formData:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error in validateAndSubmit:', error);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(validateAndSubmit)} 
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бренд</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите бренд" />
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
                  <FormLabel>Категория</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                    defaultValue={undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
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
                  <FormLabel>Материал</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите материал" />
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
        </div>

        {/* Translations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title_uz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название (UZ)</FormLabel>
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
                  <FormLabel>Описание (UZ)</FormLabel>
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
                  <FormLabel>Название (RU)</FormLabel>
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
                  <FormLabel>Описание (RU)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Product Attributes */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-lg font-semibold">Атрибуты продукта</h3>
            <Button
              type="button"
              onClick={() => append({
                color_code: '#000000',
                color_name_uz: '',
                color_name_ru: '',
                image: new File([], 'placeholder.jpg'),
                sizes: [],
                price: 0,
                new_price: 0,
                quantity: 0
              })}
              variant="outline"
            >
              <PlusIcon className="w-4 h-4 mr-2" /> Добавить атрибут
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-700">Атрибут #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color Section */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.color_code`}
                    render={({ field: colorCodeField }) => (
                      <FormItem>
                        <FormLabel>Код цвета</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="color" 
                            {...colorCodeField}
                            className="w-12 h-10 p-1 rounded"
                          />
                          <Input 
                            {...colorCodeField}
                            className="flex-1"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.color_name_uz`}
                    render={({ field: colorNameUzField }) => (
                      <FormItem>
                        <FormLabel>Название цвета (UZ)</FormLabel>
                        <FormControl>
                          <Input {...colorNameUzField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.color_name_ru`}
                    render={({ field: colorNameRuField }) => (
                      <FormItem>
                        <FormLabel>Название цвета (RU)</FormLabel>
                        <FormControl>
                          <Input {...colorNameRuField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Price, New Price, and Quantity Section */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.new_price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новая цена</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Цена со скидкой" 
                            {...field}
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`product_attributes.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sizes Section */}
                <FormField
                  control={form.control}
                  name={`product_attributes.${index}.sizes`}
                  render={({ field: sizesField }) => (
                    <FormItem>
                      <FormLabel>Размеры</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-lg bg-white">
                        {sizes.map((size) => (
                          <div key={size.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`size-${index}-${size.id}`}
                              checked={sizesField.value?.includes(size.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const updatedSizes = checked
                                  ? [...(sizesField.value || []), size.id]
                                  : (sizesField.value || []).filter(id => id !== size.id);
                                sizesField.onChange(updatedSizes);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label 
                              htmlFor={`size-${index}-${size.id}`} 
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {size.name_uz}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Section */}
                <FormField
                  control={form.control}
                  name={`product_attributes.${index}.image`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Изображение</FormLabel>
                      <div className="space-y-4">
                        {typeof field.value === 'string' && (
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                            <img 
                              src={field.value} 
                              alt="Product" 
                              className="w-full h-full object-cover"
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
                            className="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Display form-level errors for product attributes */}
        {form.formState.errors.product_attributes?.message && (
          <div className="text-red-500 text-sm">
            {form.formState.errors.product_attributes.message}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting || !form.formState.isValid}
          onClick={() => {
            console.log('Current form values:', form.getValues());
            console.log('Form errors:', form.formState.errors);
          }}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить продукт'}
        </Button>

        {/* Add error display */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="text-red-500 mt-4">
            <p>В форме есть ошибки:</p>
            <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
          </div>
        )}
      </form>
    </Form>
  );
}
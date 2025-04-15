import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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

type ProductFormSchema = ProductFormData;

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

  // Transform the defaultValues to handle image conversion
  const transformedDefaultValues = defaultValues ? {
    ...defaultValues,
    product_attributes: defaultValues.product_attributes?.map(attr => ({
      ...attr,
      attribute_images: attr.attribute_images?.map(img => ({
        id: img.id,
        image: typeof img.image === 'string' ? new File([], img.image) : img.image
      }))
    }))
  } : undefined;

  const form = useForm<ProductFormSchema>({
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
        attribute_images: [],
        sizes: [],
        price: 0,
        new_price: 0,
        quantity: 0
      }],
      ...transformedDefaultValues
    },
  });

  console.log('C. Form initialized with values:', form.getValues());
  console.log('Form errors:', form.formState.errors); // Add this line to debug validation errors

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'product_attributes',
  });

  // Single field array for all attribute images


  const handleImageAppend = (attributeIndex: number, file: File) => {
    const currentAttributes = form.getValues('product_attributes');
    const updatedAttributes = [...currentAttributes];
    if (!updatedAttributes[attributeIndex].attribute_images) {
      updatedAttributes[attributeIndex].attribute_images = [];
    }
    updatedAttributes[attributeIndex].attribute_images.push({ image: file });
    form.setValue('product_attributes', updatedAttributes);
  };

  const handleImageRemove = (attributeIndex: number, imageIndex: number) => {
    const currentAttributes = form.getValues('product_attributes');
    const updatedAttributes = [...currentAttributes];
    updatedAttributes[attributeIndex].attribute_images.splice(imageIndex, 1);
    form.setValue('product_attributes', updatedAttributes);
  };

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
          attribute_images: attr.attribute_images.map(image => ({
            image: typeof image.image === 'string' ? new File([], image.image) : image.image
          })),
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
                attribute_images: [],
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
                    </FormItem>
                  )}
                />

                {/* Updated Image Section */}
                <div className="space-y-4">
                  <FormLabel>Изображения</FormLabel>
                  
                  {/* Single Image Input */}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageAppend(index, file);
                      }
                    }}
                    className="bg-white w-full"
                  />

                  {/* Image Preview Grid */}
                  {form.getValues(`product_attributes.${index}.attribute_images`)?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {form.getValues(`product_attributes.${index}.attribute_images`)?.map((imageField: any, imageIndex: number) => (
                        <div key={imageIndex} className="relative group">
                          <div className="aspect-square rounded-lg border overflow-hidden bg-white">
                            {(() => {
                              const imageValue = imageField.image;
                              if (imageValue instanceof File) {
                                return (
                                  <div className="w-full h-full relative">
                                    <img 
                                      src={URL.createObjectURL(imageValue)}
                                      alt={`Preview ${imageIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                  </div>
                                );
                              } else if (typeof imageValue === 'string') {
                                return (
                                  <img 
                                    src={imageValue}
                                    alt={`Product ${imageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                );
                              }
                              return null;
                            })()}
                          </div>
                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index, imageIndex)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          onClick={() => {
            console.log('Current form values:', form.getValues());
            console.log('Form errors:', form.formState.errors);
          }}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить продукт'}
        </Button>
      </form>
    </Form>
  );
}
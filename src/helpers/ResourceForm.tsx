import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
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


// Update the FormField interface to be more specific about the field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  required?: boolean;
  validation?: (schema: z.ZodTypeAny) => z.ZodTypeAny;
  readOnly?: boolean;
  imageUrl?: string;
}

// Update the ResourceFormProps interface to be more specific about generic type T
interface ResourceFormProps<T extends Record<string, any>> {
  fields: FormField[];
  onSubmit: (data: T) => void;
  defaultValues?: Partial<T>;
  isSubmitting?: boolean;
  title: string;
  hideSubmitButton?: boolean;
}

export function ResourceForm<T extends Record<string, any>>({
  fields,
  onSubmit,
  defaultValues = {},
  isSubmitting = false,
  title,
  hideSubmitButton = false,
}: ResourceFormProps<T>) {
  const formSchema = z.object(
    fields.reduce((acc, field) => {
      let schema: z.ZodTypeAny;
      
      if (field.type === 'number') {
        schema = z.coerce.number();
      } else if (field.type === 'file') {
        // Handle both File instances and string URLs
        schema = z.union([
          z.instanceof(File),
          z.string(),
          z.undefined()
        ]);
      } else {
        schema = z.string();
      }
      
      if (field.required) {
        if (field.type === 'number') {
          schema = (schema as z.ZodNumber).min(1, `${field.label} обязательно для заполнения`);
        } else if (field.type === 'file') {
          schema = z.union([
            z.instanceof(File),
            z.string()
          ]).refine(val => val !== undefined && val !== null, {
            message: `${field.label} обязательно для заполнения`
          });
        } else {
          schema = (schema as z.ZodString).min(1, `${field.label} обязательно для заполнения`);
        }
      } else {
        schema = schema.optional();
      }
      
      if (field.validation) {
        schema = field.validation(schema);
      }
      
      return { ...acc, [field.name]: schema };
    }, {}) as Record<string, z.ZodTypeAny>
  );

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const { setValue } = form;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{title}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === 'textarea' ? (
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                        readOnly={field.readOnly}
                        className={field.readOnly ? 'bg-gray-100' : ''}
                      />
                    ) : field.type === 'select' ? (
                      <Select
                        onValueChange={formField.onChange}
                        defaultValue={String(formField.value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'file' ? (
                      <div className="space-y-2">
                        <div className="space-y-4">
                          {field.imageUrl && (
                            <div className="w-24 h-24 relative rounded-lg overflow-hidden border">
                              <img 
                                src={field.imageUrl} 
                                alt="Current image" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue(field.name, file);
                              }
                            }}
                            required={field.required && !field.imageUrl}
                            accept="image/*"
                          />
                        </div>
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        {...formField}
                        readOnly={field.readOnly}
                        className={field.readOnly ? 'bg-gray-100' : ''}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          
          {!hideSubmitButton && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
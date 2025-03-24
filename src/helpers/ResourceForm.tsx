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

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  required?: boolean;
  validation?: (schema: z.ZodTypeAny) => z.ZodTypeAny;
  readOnly?: boolean;
}

interface ResourceFormProps<T> {
  fields: FormField[];
  onSubmit: (data: T) => void;
  defaultValues?: Partial<T>;
  isSubmitting?: boolean;
  title: string;
  hideSubmitButton?: boolean;
}

export function ResourceForm<T>({
  fields,
  onSubmit,
  defaultValues = {},
  isSubmitting = false,
  title,
  hideSubmitButton = false,
}: ResourceFormProps<T>) {
  // Dynamically create Zod schema based on fields
  const formSchema = z.object(
    fields.reduce((acc, field) => {
      let schema: z.ZodTypeAny;
      
      if (field.type === 'number') {
        schema = z.coerce.number();
      } else if (field.type === 'file') {
        schema = z.instanceof(File).optional();
      } else {
        schema = z.string();
      }
      
      if (field.required) {
        if (field.type === 'number') {
          schema = (schema as z.ZodNumber).min(1, `${field.label} is required`);
        } else if (field.type === 'file') {
          // For files, we keep it optional but can add validation if needed
        } else {
          schema = (schema as z.ZodString).min(1, `${field.label} is required`);
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
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            formField.onChange(file);
                          }
                        }}
                      />
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
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
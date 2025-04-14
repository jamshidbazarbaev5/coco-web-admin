import { useState } from 'react';
import { toast } from 'sonner';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Service, useGetServices, useCreateService, useUpdateService, useDeleteService } from '../api/service';

export function ServicePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetServices({
    params: {
      page: page,
      page_size: 10
    }
  });
  const services = data?.results || [];

  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

  const columns = [
    { header: 'Заголовок (РУ)', accessorKey: 'title_ru' },
    { header: 'Заголовок (УЗ)', accessorKey: 'title_uz' },
    { 
      header: 'Сервис 1 (РУ)', 
      accessorKey: 'services_ru.service_1',
      cell: (service: Service) => (
        <div className="max-w-[200px] truncate">{service.services_ru.service_1}</div>
      )
    },
  ];

  const formFields = [
    {
      name: 'title_ru',
      label: 'Заголовок (Русский)',
      type: 'text' as const,
      placeholder: 'Введите заголовок на русском',
      required: true,
    },
    {
      name: 'title_uz',
      label: 'Заголовок (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите заголовок на узбекском',
      required: true,
    },
    {
      name: 'services_ru.service_1',
      label: 'Сервис 1 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 1 на русском',
      required: true,
    },
    {
      name: 'services_ru.service_2',
      label: 'Сервис 2 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 2 на русском',
      required: true,
    },
    {
      name: 'services_ru.service_3',
      label: 'Сервис 3 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 3 на русском',
      required: true,
    },
    {
      name: 'services_uz.service_1',
      label: 'Сервис 1 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 1 на узбекском',
      required: true,
    },
    {
      name: 'services_uz.service_2',
      label: 'Сервис 2 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 2 на узбекском',
      required: true,
    },
    {
      name: 'services_uz.service_3',
      label: 'Сервис 3 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите сервис 3 на узбекском',
      required: true,
    },
    {
      name: 'subtitles_ru.subtitle_1',
      label: 'Подзаголовок 1 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 1 на русском',
      required: true,
    },
    {
      name: 'subtitles_ru.subtitle_2',
      label: 'Подзаголовок 2 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 2 на русском',
      required: true,
    },

    {
      name: 'subtitles_uz.subtitle_1',
      label: 'Подзаголовок 1 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 1 на узбекском',
      required: true,
    },
    {
      name: 'subtitles_uz.subtitle_2',
      label: 'Подзаголовок 2 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 2 на узбекском',
      required: true,
    },
    {
      name: 'image_first',
      label: 'Первое изображение',
      type: 'file' as const,
      required: !selectedService?.image_first,
      preview: selectedService?.image_first,
      existingImage: selectedService?.image_first 
    },
    {
      name: 'image_second',
      label: 'Второе изображение',
      type: 'file' as const,
      required: !selectedService?.image_second,
      preview: selectedService?.image_second ,
      existingImage: selectedService?.image_second 
    },
  ];

  const handleSubmit = async (data: Service) => {
    const formData = new FormData();
    
    if (selectedService?.id) {
      formData.append('id', selectedService.id.toString());
    }

    // Append basic fields
    formData.append('title_ru', data.title_ru);
    formData.append('title_uz', data.title_uz);

  
    // Append images
    if (data.image_first instanceof File) {
      formData.append('image_first', data.image_first);
    }


    if(data.image_second instanceof File) { 
      formData.append('image_second', data.image_second);
    } // Append services and subtitles


    formData.append('services_ru', JSON.stringify(data.services_ru));
    formData.append('services_uz', JSON.stringify(data.services_uz));
    formData.append('subtitles_ru', JSON.stringify(data.subtitles_ru));
    formData.append('subtitles_uz', JSON.stringify(data.subtitles_uz));

    if (selectedService?.id) {
      updateService(
        { formData, id: selectedService.id },
        {
          onSuccess: () => {
            toast.success('Сервис успешно обновлен');
            setIsFormOpen(false);
            setSelectedService(null);
            refetch();
          },
          onError: () => toast.error('Не удалось обновить сервис'),
        }
      );
    } else {
      createService(formData, {
        onSuccess: () => {
          toast.success('Сервис успешно создан');
          setIsFormOpen(false);
          refetch();
        },
        onError: () => toast.error('Не удалось создать сервис'),
      });
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот сервис?')) {
      deleteService(id, {
        onSuccess: () => {
          toast.success('Сервис успешно удален');
          refetch();
        },
        onError: () => toast.error('Не удалось удалить сервис'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <div className="hidden">Trigger</div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <ResourceForm<Service>
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={selectedService || {}}
            isSubmitting={isCreating || isUpdating}
            title={selectedService ? 'Редактировать сервис' : 'Создать сервис'}
          />
        </DialogContent>
      </Dialog>

      <ResourceTable<Service>
        data={services}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedService(null);
          setIsFormOpen(true);
        }}
        currentPage={page}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        pageSize={10}
       
      />
    </div>
  );
}

import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetAbouts, useCreateAbout, useUpdateAbout, useDeleteAbout } from '../api/about';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { About } from '../api/about';

export function AboutPage() {
  const [selectedAbout, setSelectedAbout] = useState<About | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetAbouts({
    params: {
      page: page,
      page_size: 10
    }
  });
  const abouts = data?.results || [];

  const { mutate: createAbout, isPending: isCreating } = useCreateAbout();
  const { mutate: updateAbout, isPending: isUpdating } = useUpdateAbout();
  const { mutate: deleteAbout } = useDeleteAbout();

  const columns = [
    { header: 'Заголовок (РУ)', accessorKey: 'title_ru' },
    { header: 'Заголовок (УЗ)', accessorKey: 'title_uz' },
    { 
      header: 'Описание (РУ)', 
      accessorKey: 'description_ru',
      cell: (about: About) => (
        <div className="max-w-[200px] truncate">{about.description_ru}</div>
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
      name: 'description_ru',
      label: 'Описание (Русский)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на русском',
      required: true,
    },
    {
      name: 'description_uz',
      label: 'Описание (Узбекский)',
      type: 'textarea' as const,
      placeholder: 'Введите описание на узбекском',
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
      name: 'subtitles_ru.subtitle_3',
      label: 'Подзаголовок 3 (Русский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 3 на русском',
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
      name: 'subtitles_uz.subtitle_3',
      label: 'Подзаголовок 3 (Узбекский)',
      type: 'text' as const,
      placeholder: 'Введите подзаголовок 3 на узбекском',
      required: true,
    },
  ];

  const handleSubmit = (data: About) => {
    if (selectedAbout?.id) {
      updateAbout(
        { 
            id: selectedAbout.id!, ...data
        },
        {
          onSuccess: () => {
            toast.success('Информация успешно обновлена');
            setIsFormOpen(false);
            setSelectedAbout(null);
            refetch();
          },
          onError: () => toast.error('Не удалось обновить информацию'),
        }
      );
    } else {
      createAbout(data, {
        onSuccess: () => {
          toast.success('Информация успешно создана');
          setIsFormOpen(false);
          refetch();
        },
        onError: () => toast.error('Не удалось создать информацию'),
      });
    }
  };

  const handleEdit = (about: About) => {
    setSelectedAbout(about);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту информацию?')) {
      deleteAbout(id, {
        onSuccess: () => {
          toast.success('Информация успешно удалена');
          refetch();
        },
        onError: () => toast.error('Не удалось удалить информацию'),
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
          <ResourceForm<About>
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={selectedAbout || {}}
            isSubmitting={isCreating || isUpdating}
            title={selectedAbout ? 'Редактировать информацию' : 'Создать информацию'}
          />
        </DialogContent>
      </Dialog>

      <ResourceTable<About>
        data={abouts}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedAbout(null);
          setIsFormOpen(true);
        }}
        currentPage={page}
        totalCount={data?.count || 0}
        onPageChange={(newPage) => setPage(newPage)}
        pageSize={10}
      />
    </div>
  );
}

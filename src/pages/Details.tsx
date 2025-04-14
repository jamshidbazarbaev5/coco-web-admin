import { useState } from 'react';
import { ResourceForm } from '../helpers/ResourceForm';
import { ResourceTable } from '../helpers/ResourceTable';
import {
  ContactDetail,
  useGetContactDetails,
  useCreateContactDetail,
  useUpdateContactDetail,
  useDeleteContactDetail,
} from '../api/details';
import { Dialog, DialogContent } from '../components/ui/dialog';

export function ContactDetailsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactDetail | null>(null);

  const { data: contactDetails, isLoading, refetch } = useGetContactDetails();
  const { mutate: createContact, isPending: isCreating } = useCreateContactDetail();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContactDetail();
  const { mutate: deleteContact } = useDeleteContactDetail();

  const handleSubmit = (data: ContactDetail) => {
    const formattedData = {
      ...data,
      social_media_urls: {
        instagram: data.instagram || '',
        instagram_name: data.instagram_name || 'Instagram',
        telegram: data.telegram || '',
        telegram_name: data.telegram_name || 'Телеграм',
        facebook: data.facebook || '',
        facebook_name: data.facebook_name || 'FaceBook',
      },
    };

    if (editingItem?.id) {
      updateContact(
        { id: editingItem.id, ...formattedData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            refetch();
          },
        }
      );
    } else {
      createContact(formattedData, {
        onSuccess: () => {
          setIsFormOpen(false);
          refetch();
        },
      });
    }
  };

  const formFields = [
    {
      name: 'address_uz',
      label: 'Адрес (UZ)',
      type: 'textarea' as const,
      required: true,
    },
    {
      name: 'address_ru',
      label: 'Адрес (RU)',
      type: 'textarea' as const,
      required: true,
    },
    {
      name: 'phone',
      label: 'Телефон',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'map_url',
      label: 'Ссылка на карту',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'instagram',
      label: 'Ссылка Instagram',
      type: 'text' as const,
    },
    {
      name: 'instagram_name',
      label: 'Название Instagram',
      type: 'text' as const,
    },
    {
      name: 'telegram',
      label: 'Ссылка Telegram',
      type: 'text' as const,
    },
    {
      name: 'telegram_name',
      label: 'Название Telegram',
      type: 'text' as const,
    },
    {
      name: 'facebook',
      label: 'Ссылка Facebook',
      type: 'text' as const,
    },
    {
      name: 'facebook_name',
      label: 'Название Facebook',
      type: 'text' as const,
    },
  ];

  const columns = [
    { header: 'Адрес (UZ)', accessorKey: 'address_uz' },
    { header: 'Адрес (RU)', accessorKey: 'address_ru' },
    { header: 'Телефон', accessorKey: 'phone' },
    {
      header: 'Социальные сети',
      accessorKey: (row: ContactDetail) => {
        const urls = row.social_media_urls || {};
        return (
          <div className="space-y-1">
            {Object.entries(urls).map(([platform, url]) => {
              if (platform.includes('_name') || !url) return null;
              const name = urls[`${platform}_name`] || platform;
              return (
                <div key={platform} className="text-sm">
                  <span className="font-medium capitalize">{name}:</span>{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {url}
                  </a>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 h-screen flex flex-col">
      <div className="flex-1 overflow-auto">
        <ResourceTable
          data={contactDetails?.results || []}
          columns={columns}
          isLoading={isLoading}
          onEdit={(item) => {
            setEditingItem({
              ...item,
              ...item.social_media_urls,
            });
            setIsFormOpen(true);
          }}
          onDelete={(id) => deleteContact(id)}
          onAdd={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingItem || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingItem ? 'Редактировать контактные данные' : 'Добавить контактные данные'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
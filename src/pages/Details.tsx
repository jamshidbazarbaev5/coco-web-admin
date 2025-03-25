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
    // Format social media URLs
    const formattedData = {
      ...data,
      social_media_urls: {
        instagram: data.instagram || '',
        telegram: data.telegram || '',
        facebook: data.facebook || '',
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
      label: 'Address (UZ)',
      type: 'textarea' as const,
      required: true,
    },
    {
      name: 'address_ru',
      label: 'Address (RU)',
      type: 'textarea' as const,
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'map_url',
      label: 'Map URL',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'instagram',
      label: 'Instagram URL',
      type: 'text' as const,
    },
    {
      name: 'telegram',
      label: 'Telegram URL',
      type: 'text' as const,
    },
    {
      name: 'facebook',
      label: 'Facebook URL',
      type: 'text' as const,
    },
  ];

  const columns = [
    { header: 'Address (UZ)', accessorKey: 'address_uz' },
    { header: 'Address (RU)', accessorKey: 'address_ru' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Social Media',
      accessorKey: (row: ContactDetail) => {
        const urls = row.social_media_urls || {};
        return (
          <div className="space-y-1">
            {Object.entries(urls).map(([platform, url]) => (
              url && (
                <div key={platform} className="text-sm">
                  <span className="font-medium capitalize">{platform}:</span>{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {url}
                  </a>
                </div>
              )
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6">
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingItem || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingItem ? 'Edit Contact Details' : 'Add Contact Details'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
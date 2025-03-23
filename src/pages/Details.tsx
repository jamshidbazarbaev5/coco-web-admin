import React from 'react';
import { toast } from 'sonner';
import {
  useGetContactDetails,
  useCreateContactDetail,
  useUpdateContactDetail,
  useDeleteContactDetail,
  type ContactDetail,
} from '../api/details';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, type FormField } from '../helpers/ResourceForm';
import { Dialog, DialogContent } from '../components/ui/dialog';

export function ContactDetailsPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ContactDetail | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { 
    data: { results: contactDetails = [], count = 0 } = {}, 
    isLoading 
  } = useGetContactDetails({ 
    params: {
      page: page,
      page_size: pageSize
    }
  });
  const { mutate: createDetail, isPending: isCreating } = useCreateContactDetail();
  const { mutate: updateDetail, isPending: isUpdating } = useUpdateContactDetail();
  const { mutate: deleteDetail } = useDeleteContactDetail();

  const formFields: FormField[] = [
    {
      name: 'address_ru',
      label: 'Address (Russian)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'address_uz',
      label: 'Address (Uzbek)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      required: true,
    },
    {
      name: 'map_url',
      label: 'Map URL',
      type: 'text',
      required: true,
    },
    {
      name: 'social_media_urls.instagram',
      label: 'Instagram URL',
      type: 'text',
    },
    {
      name: 'social_media_urls.telegram',
      label: 'Telegram URL',
      type: 'text',
    },
    {
      name: 'social_media_urls.facebook',
      label: 'Facebook URL',
      type: 'text',
    },
  ];

  const columns = [
    {
      header: 'Address (RU)',
      accessorKey: 'address_ru',
    },
    {
      header: 'Address (UZ)',
      accessorKey: 'address_uz',
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Social Media',
      accessorKey: (row: ContactDetail) => {
        const platforms = Object.keys(row.social_media_urls || {}).filter(
          key => row.social_media_urls[key]
        );
        return platforms.join(', ');
      },
    },
  ];

  const handleSubmit = async (data: ContactDetail) => {
    try {
      const formattedData = {
        ...data,
        social_media_urls: {
          instagram: data.social_media_urls?.instagram || '',
          telegram: data.social_media_urls?.telegram || '',
          facebook: data.social_media_urls?.facebook || '',
        }
      };

      if (editingItem?.id) {
        await updateDetail({ id: editingItem.id, ...formattedData });
        toast.success('Contact details updated successfully');
      } else {
        await createDetail(formattedData);
        toast.success('Contact details created successfully');
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact detail?')) {
      try {
        await deleteDetail(id);
        toast.success('Contact details deleted successfully');
      } catch (error) {
        toast.error('An error occurred');
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={contactDetails}
        columns={columns}
        isLoading={isLoading}
        onAdd={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        totalCount={count}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
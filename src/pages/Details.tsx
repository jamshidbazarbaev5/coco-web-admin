import { useState } from 'react';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { ResourceTable } from '../helpers/ResourceTable';
import {
  ContactDetail,
  useGetContactDetails,
  useCreateContactDetail,
  useUpdateContactDetail,
  useDeleteContactDetail,
} from '../api/details';

export function Details() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContactDetail | null>(null);

  const { data: contactDetails, isLoading, refetch } = useGetContactDetails();
  const { mutateAsync: createContact, isPending: isCreating } = useCreateContactDetail();
  const { mutateAsync: updateContact, isPending: isUpdating } = useUpdateContactDetail();
  const { mutateAsync: deleteContact } = useDeleteContactDetail();

  const formFields: FormField[] = [
    { name: 'address_uz', label: 'Address (UZ)', type: 'textarea', required: true },
    { name: 'address_ru', label: 'Address (RU)', type: 'textarea', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'map_url', label: 'Map URL', type: 'text', required: true },
    { name: 'social_media_urls.instagram', label: 'Instagram URL', type: 'text' },
    { name: 'social_media_urls.telegram', label: 'Telegram URL', type: 'text' },
    { name: 'social_media_urls.facebook', label: 'Facebook URL', type: 'text' },
  ];

  const columns = [
    { header: 'Address (UZ)', accessorKey: 'address_uz' },
    { header: 'Address (RU)', accessorKey: 'address_ru' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Social Media',
      accessorKey: (row: ContactDetail) => {
        const urls = [];
        if (row.social_media_urls.instagram) urls.push('Instagram');
        if (row.social_media_urls.telegram) urls.push('Telegram');
        if (row.social_media_urls.facebook) urls.push('Facebook');
        return urls.join(', ');
      },
    },
  ];

  const handleSubmit = async (data: any) => {
    try {
      // Ensure social_media_urls is an object
      const formattedData = {
        ...data,
        social_media_urls: {
          instagram: data['social_media_urls.instagram'] || '',
          telegram: data['social_media_urls.telegram'] || '',
          facebook: data['social_media_urls.facebook'] || '',
        }
      };

      // Remove the flattened fields
      delete formattedData['social_media_urls.instagram'];
      delete formattedData['social_media_urls.telegram'];
      delete formattedData['social_media_urls.facebook'];

      if (selectedItem?.id) {
        await updateContact({ id: selectedItem.id, ...formattedData });
      } else {
        await createContact(formattedData);
      }
      setIsEditing(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error('Error saving contact details:', error);
    }
  };

  const handleEdit = (item: ContactDetail) => {
    // Flatten the social_media_urls object into individual fields
    const flattenedData = {
      ...item,
      'social_media_urls.instagram': item.social_media_urls.instagram || '',
      'social_media_urls.telegram': item.social_media_urls.telegram || '',
      'social_media_urls.facebook': item.social_media_urls.facebook || '',
    };
    setSelectedItem(flattenedData);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        refetch();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-6">
        <ResourceForm
          fields={formFields}
          onSubmit={handleSubmit}
          defaultValues={selectedItem || undefined}
          isSubmitting={isCreating || isUpdating}
          title={selectedItem ? 'Edit Contact Details' : 'Add Contact Details'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={contactDetails?.results || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => setIsEditing(true)}
        totalCount={contactDetails?.count || 0}
        currentPage={1}
        
      />
    </div>
  );
}

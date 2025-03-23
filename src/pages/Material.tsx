import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { Material, useGetMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from '../api/material';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Pagination } from '../components/ui/Pagination';

export function MaterialsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    data: materialsData,
    isLoading 
  } = useGetMaterials({ 
    params: { page: currentPage }
  });

  const materials = materialsData?.results || [];
  const totalPages = Math.ceil((materialsData?.count || 0) / 10);

  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
  const { mutate: deleteMaterial } = useDeleteMaterial();

  const columns = [
    {
      header: 'Name (Russian)',
      accessorKey: 'name_ru',
    },
    {
      header: 'Name (Uzbek)',
      accessorKey: 'name_uz',
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'name_ru',
      label: 'Name (Russian)',
      type: 'text',
      placeholder: 'Enter material name in Russian',
      required: true,
    },
    {
      name: 'name_uz',
      label: 'Name (Uzbek)',
      type: 'text',
      placeholder: 'Enter material name in Uzbek',
      required: true,
    },
  ];

  const handleSubmit = (data: Material) => {
    if (editingMaterial) {
      updateMaterial({ id: editingMaterial.id!, ...data }, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingMaterial(null);
        },
      });
    } else {
      createMaterial(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this material?')) {
      deleteMaterial(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container py-6">
      <ResourceTable
        data={materials}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingMaterial(null);
          setIsFormOpen(true);
        }}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingMaterial || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingMaterial ? 'Edit Material' : 'Add New Material'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
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
      header: 'Название (Русский)',
      accessorKey: 'name_ru',
    },
    {
      header: 'Название (Узбекский)',
      accessorKey: 'name_uz',
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'name_ru',
      label: 'Название (Русский)',
      type: 'text',
      placeholder: 'Введите название материала на русском',
      required: true,
    },
    {
      name: 'name_uz',
      label: 'Название (Узбекский)',
      type: 'text',
      placeholder: 'Введите название материала на узбекском',
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
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
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
            title={editingMaterial ? 'Редактировать материал' : 'Добавить новый материал'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
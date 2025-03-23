import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { Brand, useGetBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../api/brand';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { toast } from 'sonner'

export function BrandsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [page, setPage] = useState(1);

  const { data: brandsData, isLoading } = useGetBrands({
    params: {
      page: page,
      page_size: 10
    }
  });
  const brands = brandsData?.results || [];
  
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutate: deleteBrand } = useDeleteBrand();

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Brand Name',
      type: 'text',
      placeholder: 'Enter brand name',
      required: true,
    },
  ];

  const handleSubmit = (data: Partial<Brand>) => {
    if (editingBrand) {
      updateBrand(
        { id: editingBrand.id, name: data.name! } as Brand,
        {
          onSuccess: () => {
            toast.success('Brand updated successfully');
            setIsFormOpen(false);
            setEditingBrand(null);
          },
          onError: () => toast.error('Failed to update brand'),
        }
      );
    } else {
      createBrand(data as Brand, {
        onSuccess: () => {
          toast.success('Brand created successfully');
          setIsFormOpen(false);
        },
        onError: () => toast.error('Failed to create brand'),
      });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      deleteBrand(id, {
        onSuccess: () => toast.success('Brand deleted successfully'),
        onError: () => toast.error('Failed to delete brand'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={brands}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingBrand(null);
          setIsFormOpen(true);
        }}
        totalCount={brandsData?.count || 0}
        pageSize={10}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}



                 
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingBrand || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingBrand ? 'Edit Brand' : 'Create Brand'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
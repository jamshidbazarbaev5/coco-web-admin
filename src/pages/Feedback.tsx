import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { 
  useGetFeedbacks, 
  useCreateFeedback, 
  useUpdateFeedback, 
  useDeleteFeedback,
  Feedback
} from '../api/feeedback';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function FeedbackPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [page, setPage] = useState(1);
  
  const { 
    data: { results: feedbacks = [], count = 0 } = {}, 
    isLoading 
  } = useGetFeedbacks({
    params: {
      page: page,
      page_size: 10
    }
  });
  const createMutation = useCreateFeedback();
  const updateMutation = useUpdateFeedback();
  const deleteMutation = useDeleteFeedback();
  
  const handleAdd = () => {
    setCurrentFeedback(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Feedback deleted successfully');
      } catch (error) {
        toast.error('Failed to delete feedback');
      }
    }
  };
  
  const handleSubmit = async (data: Feedback) => {
    try {
      if (currentFeedback?.id) {
        await updateMutation.mutateAsync({ ...data, id: currentFeedback.id });
        toast.success('Feedback updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Feedback created successfully');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Failed to save feedback');
    }
  };
  
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name',
      required: true,
    },
    {
      name: 'phone_number',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter phone number',
      required: true,
    },
    {
      name: 'feedback',
      label: 'Feedback',
      type: 'textarea',
      placeholder: 'Enter feedback',
      required: true,
    },
  ];
  
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Phone Number',
      accessorKey: 'phone_number',
    },
    {
      header: 'Feedback',
      accessorKey: 'feedback',
      cell: (row: Feedback) => (
        <div className="max-w-xs truncate">{row.feedback}</div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: (row: Feedback) => (
        row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'
      ),
    },
  ];
  
  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={feedbacks}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        totalCount={count}
        pageSize={10}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogTitle>
            {currentFeedback ? 'Edit Feedback' : 'Add New Feedback'}
          </DialogTitle>
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={currentFeedback || {}}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            title=""
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { 
  useGetFeedbacks, 
  useDeleteFeedback,
  Feedback
} from '../api/feeedback';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function FeedbackPage() {
  const [isViewOpen, setIsViewOpen] = useState(false);
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
  const deleteMutation = useDeleteFeedback();
  
  const handleEdit = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setIsViewOpen(true);
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
  
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'phone_number',
      label: 'Phone Number',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'feedback',
      label: 'Feedback',
      type: 'textarea',
      readOnly: true,
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
        totalCount={count}
        pageSize={10}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogTitle>View Feedback</DialogTitle>
          <ResourceForm
            fields={formFields}
            onSubmit={() => {}}
            defaultValues={currentFeedback || {}}
            isSubmitting={false}
            title=""
            hideSubmitButton={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
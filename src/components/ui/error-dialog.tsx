import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { useErrorStore } from '../../store/errorStore';

export function ErrorDialog() {
  const { isOpen, message, clearError } = useErrorStore();

  return (
    <Dialog open={isOpen} onOpenChange={() => clearError()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ошибка</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
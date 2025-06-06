import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  EyeIcon,
  TrashIcon,
  PlusIcon
} from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
}

interface ResourceTableProps<T extends { id?: number }> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  currentPage?: number;
}

export function ResourceTable<T extends { id?: number }>({
  data,
  columns,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  currentPage = 1,
}: ResourceTableProps<T>) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    let startPage = Math.max(currentPage - 1, 2);
    let endPage = Math.min(currentPage + 1, totalPages - 1);

    if (currentPage <= 3) {
      endPage = 4;
    }

    if (currentPage >= totalPages - 2) {
      startPage = totalPages - 3;
    }

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ресурсы</h2>
        {onAdd && (
          <Button onClick={onAdd} className="flex items-center gap-1">
            <PlusIcon className="h-4 w-4" /> Добавить новый
          </Button>
        )}
      </div>
      
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50/50">
              {columns.map((column, index) => (
                <TableHead key={index} className="text-xs uppercase text-gray-500 font-medium">
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="text-xs uppercase text-gray-500 font-medium text-right">
                  Действия
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center text-gray-500">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center text-gray-500">
                  Данные отсутствуют
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex} 
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell 
                        ? column.cell(row)
                        : typeof column.accessorKey === 'function'
                          ? column.accessorKey(row)
                          : String(
                              typeof column.accessorKey === 'string' 
                                ? (row as any)[column.accessorKey] || ''
                                : row[column.accessorKey as keyof T] || ''
                            )}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right w-[100px]">
                      <div className="flex gap-1 justify-end">
                        {onEdit && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit(row)}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <EyeIcon className="h-4 w-4 text-gray-500" />
                          </Button>
                        )}
                        {onDelete && row.id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete(row.id!)}
                            className="h-8 w-8 p-0 hover:bg-red-50 text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center text-sm text-gray-600">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange?.(currentPage - 1)} 
            disabled={currentPage === 1}
            className="hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2">
                  {page}
                </span>
              )
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPageChange?.(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="hover:bg-gray-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
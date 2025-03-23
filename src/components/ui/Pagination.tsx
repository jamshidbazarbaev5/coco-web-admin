interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => onPageChange(index + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-white border border-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-white border border-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }
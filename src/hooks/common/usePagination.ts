import { useState, useEffect } from 'react';
import { useApi } from './useApi';

type ApiResponse<T> = {
  data: T[];
  error: string | null;
  loading: boolean;
  page: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  allData:T[] | null;
};

export function usePagination<T>(endpoint: string, initialPage = 1, pageSize = 30): ApiResponse<T> {
  const { data: allData, error, loading } = useApi<T[]>(endpoint);
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    if (allData) {
      const total = Math.ceil(allData.length / pageSize);
      setTotalPages(total);

      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      setData(allData.slice(start, end));
    }
  }, [allData, page, pageSize]);

  const nextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));

  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  const goToPage = (pageNumber: number) => setPage(Math.max(1, Math.min(pageNumber, totalPages)));

  return { data, error, loading, page, totalPages, allData, nextPage, prevPage, goToPage };
}

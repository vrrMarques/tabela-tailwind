export function paginateData<T>(data: T[], page: number, itemsPerPage: number): T[] {
  const start = (page - 1) * itemsPerPage;
  return data.slice(start, start + itemsPerPage);
}
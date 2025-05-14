import { useState, useMemo } from "react";
import { usePagination } from "../../hooks/common/usePagination";
import Buttonxlsx from "../Buttonxlsx";

export type Post = {
  id: number;
  title: string;
  body: string;
};

const ITEMS_PER_PAGE = 15;

export default function SearchTable() {
  const {
    data: posts,
    loading,
    page,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    allData: completeData,
  } = usePagination<Post>("/posts", 1, ITEMS_PER_PAGE);

  const [searchTerm, setSearchTerm] = useState("");
  const [localPage, setLocalPage] = useState(1);

  const isFiltering = searchTerm.trim() !== "" && completeData?.length;

  const filteredData = useMemo(() => {
    if (!isFiltering) return [];
    return completeData.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, completeData]);

  const paginatedFilteredData = useMemo(() => {
    if (!isFiltering) return [];
    const start = (localPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, localPage]);

  const totalFilteredPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const totalPagesFormated = Array.from(
    { length: isFiltering ? totalFilteredPages : totalPages },
    (_, index) => index + 1
  );

  const displayData = isFiltering ? paginatedFilteredData : posts;

  return (
    <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border p-4">
      <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
        <div>
          <h5 className="text-xl font-semibold text-blue-gray-900">Tabela Interativa</h5>
          <p className="text-base font-normal text-gray-700">Teste técnico</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setLocalPage(1); // reseta para a página 1 sempre que digitar
              }}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>
          <Buttonxlsx currentPageData={displayData} allData={completeData} />
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading && !isFiltering ? (
          <p className="text-center">Carregando...</p>
        ) : (
          <table className="min-w-full text-left table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 sm:p-4 border-b">ID</th>
                <th className="p-2 sm:p-4 border-b">Título</th>
                <th className="p-2 sm:p-4 border-b">Post</th>
                <th className="p-2 sm:p-4 border-b">Editar</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((post) => (
                <tr key={post.id} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2 sm:p-4 border-b">{post.id}</td>
                  <td className="p-2 sm:p-4 border-b">{post.title}</td>
                  <td className="p-2 sm:p-4 border-b max-w-[350px] break-words whitespace-normal">
                    <span className="block break-words">{post.body}</span>
                  </td>
                  <td className="p-2 sm:p-4 border-b">
                    <button
                      className="h-8 w-8 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700"
                      type="button"
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Nenhum resultado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between p-2 mt-4">
        <button
          className="px-3 py-1 mb-2 md:mb-0 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-200"
          type="button"
          onClick={() => (isFiltering ? setLocalPage((prev) => Math.max(prev - 1, 1)) : prevPage())}
          disabled={isFiltering ? localPage === 1 : false}
        >
          Anterior
        </button>

        <div className="flex items-center gap-1 flex-wrap">
          {totalPagesFormated.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => (isFiltering ? setLocalPage(pageNumber) : goToPage(pageNumber))}
              className={`px-2 py-1 mb-1 md:mb-0 text-sm border rounded-md ${
                (isFiltering ? localPage : page) === pageNumber
                  ? "bg-gray-800 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          className="px-3 py-1 mb-2 md:mb-0 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-200"
          type="button"
          onClick={() =>
            isFiltering
              ? setLocalPage((prev) => Math.min(prev + 1, totalFilteredPages))
              : nextPage()
          }
          disabled={isFiltering ? localPage === totalFilteredPages : false}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}

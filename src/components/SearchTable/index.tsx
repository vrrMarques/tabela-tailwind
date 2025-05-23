import { useEffect, useMemo, useState } from "react";
import { usePagination } from "../../hooks/common/usePagination";
import { useEditablePosts } from "../../hooks/useEditablePosts";
import { paginateData } from "../../utils/paginateData";
import { ITEMS_PER_PAGE } from "../../constants";
import Buttonxlsx from "../Buttonxlsx";
import { MdEdit, MdDone, MdClose } from "react-icons/md";
import { toast } from "react-toastify";

export type Post = {
  id: number;
  title: string;
  body: string;
};

export default function SearchTable() {
  const { allData: completeData, loading } = usePagination<Post>(
    "/posts",
    1,
    ITEMS_PER_PAGE
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [localPage, setLocalPage] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<{
    title: boolean;
    body: boolean;
  }>({
    title: false,
    body: false,
  });

  const {
    data: localCompleteData,
    setData: setLocalCompleteData,
    editingId,
    editValues,
    setEditValues,
    startEditing,
    finishEditing,
    cancelEditing
  } = useEditablePosts(completeData || []);

  useEffect(() => {
    if (completeData?.length) {
      setLocalCompleteData(completeData);
    }
  }, [completeData]);

  const isFiltering = searchTerm.trim() !== "";

  const filteredData = useMemo(() => {
    return localCompleteData.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, localCompleteData]);

  const paginatedData = useMemo(() => {
    const base = isFiltering ? filteredData : localCompleteData;
    return paginateData(base, localPage, ITEMS_PER_PAGE);
  }, [filteredData, localCompleteData, isFiltering, localPage]);

  const totalPages = Math.ceil(
    (isFiltering ? filteredData.length : localCompleteData.length) /
      ITEMS_PER_PAGE
  );
  const totalPagesFormated = Array.from({ length: totalPages }, (_, i) => i + 1);


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
                setLocalPage(1);
              }}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <Buttonxlsx currentPageData={paginatedData} allData={localCompleteData} />
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600 text-sm">Carregando...</span>
          </div>
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
              {paginatedData.map((post) => {
                const isEditing = editingId === post.id;

                return (
                  <tr key={post.id} className="odd:bg-white even:bg-gray-50">
                    <td className="p-2 sm:p-4 border-b">{post.id}</td>
                    <td className="p-2 sm:p-4 border-b">
                      {isEditing ? (
                        <input
                          type="text"
                          className={`w-full border px-2 py-1 text-sm rounded ${
                            fieldErrors.title ? "border-red-500" : "border-gray-300"
                          }`}
                          value={editValues.title}
                          maxLength={100}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                      ) : (
                        post.title
                      )}
                    </td>
                    <td className="p-2 sm:p-4 border-b max-w-[350px] break-words whitespace-normal">
                      {isEditing ? (
                        <textarea
                          className={`w-full border px-2 py-1 text-sm rounded resize-none ${
                            fieldErrors.body ? "border-red-500" : "border-gray-300"
                          }`}
                          rows={3}
                          maxLength={255}
                          value={editValues.body}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, body: e.target.value }))
                          }
                        />
                      ) : (
                        <span className="block break-words">{post.body}</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-4 border-b">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            className="h-8 w-8 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-500 cursor-pointer"
                            type="button"
                            onClick={() => {
                              const trimmedTitle = editValues.title?.trim() ?? "";
                              const trimmedBody = editValues.body?.trim() ?? "";
                              const errors = {
                                title: !trimmedTitle,
                                body: !trimmedBody,
                              };

                              setFieldErrors(errors);

                              if (errors.title || errors.body) {
                                toast.error("Por favor, preencha todos os campos");
                                return;
                              }

                              setFieldErrors({ title: false, body: false });
                              finishEditing(post.id);
                            }}
                          >
                            <MdDone />
                          </button>

                          <button
                            className="h-8 w-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-500 cursor-pointer"
                            type="button"
                            onClick={cancelEditing}
                          >
                            <MdClose />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="h-8 w-8 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700 cursor-pointer"
                          type="button"
                          onClick={() => startEditing(post)}
                        >
                          <MdEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
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
          className="px-3 py-1 mb-2 md:mb-0 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-200 cursor-pointer"
          onClick={() => setLocalPage((prev) => Math.max(prev - 1, 1))}
          disabled={localPage === 1}
        >
          Anterior
        </button>

        <div className="flex items-center gap-1 flex-wrap">
          {totalPagesFormated.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setLocalPage(pageNumber)}
              className={`px-2 py-1 mb-1 md:mb-0 text-sm border rounded-md cursor-pointer ${
                localPage === pageNumber
                  ? "bg-gray-800 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          className="px-3 py-1 mb-2 md:mb-0 text-sm font-medium text-gray-700 border rounded-md hover:bg-gray-200 cursor-pointer"
          onClick={() => setLocalPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={localPage === totalPages}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}

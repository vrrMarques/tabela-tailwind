import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import type { Post } from '../SearchTable';
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";

type DownloadButtonProps = {
  currentPageData: Post[];
  allData: Post[] | null;
};

export default function Buttonxlsx({ currentPageData, allData }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDownload = (data: Post[], filename: string) => {
    const validData = data ?? [];
    const worksheet = XLSX.utils.json_to_sheet(validData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const toggleDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };


  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div className="py-1">
        <button
          onClick={() => handleDownload(currentPageData, 'pagina_atual')}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Página Atual
        </button>
        <button
          onClick={() => handleDownload(allData ?? [], 'todos_os_itens')}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          Todos os Itens
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md transition-all hover:shadow-lg cursor-pointer"
      >
        <span>Baixar</span>
        <PiMicrosoftExcelLogoFill size={20}/>
      </button>

      {isOpen &&
        createPortal(
          <div
            style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px`, zIndex: 9999 }}
          >
            {dropdownContent}
          </div>,
          document.body
        )}
    </div>
  );
}

import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { RawExcelRow, StoreData } from '../types';
import { processExcelData } from '../utils/helpers';

interface FileUploadProps {
  onDataLoaded: (data: StoreData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== 'string' && !(bstr instanceof ArrayBuffer)) return;
      
      try {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<RawExcelRow>(ws);
        
        if (data.length > 0) {
          const processed = processExcelData(data);
          onDataLoaded(processed);
        } else {
          alert("O arquivo parece estar vazio ou em formato inválido.");
        }
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        alert("Erro ao processar o arquivo. Verifique se é um Excel válido.");
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
          <FileSpreadsheet className="w-10 h-10 text-yellow-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Importar Dados Havanna</h2>
          <p className="text-gray-500 mt-2">Carregue seu arquivo .xlsx para gerar o painel de análise.</p>
        </div>

        <div className="relative group">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-yellow-600" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
              <p className="text-xs text-gray-500">XLSX, XLS</p>
            </div>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-left flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Estrutura necessária:</p>
            <p>Certifique-se que o Excel contém as colunas: NOME DA LOJA, VL. SELL-IN, VL. SELL-OUT, TM, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
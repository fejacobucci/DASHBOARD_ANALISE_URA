import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import './FileUploader.css';

const FileUploader = ({ onFileLoad }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        onFileLoad(content);
      };

      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Por favor, tente novamente.');
      };

      reader.readAsText(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        onFileLoad(content);
      };

      reader.readAsText(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="file-uploader-container">
      <div
        className="file-uploader-dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-icon">
          <Upload size={48} />
        </div>
        <h3>Carregar Arquivo de Logs URA</h3>
        <p>Arraste e solte ou clique para selecionar</p>
        <p className="file-format">Formatos aceitos: .txt, .csv</p>

        <div className="upload-info">
          <FileText size={20} />
          <span>Formatos suportados: ContactHistory.txt ou arquivo com pipe separado (|)</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUploader;

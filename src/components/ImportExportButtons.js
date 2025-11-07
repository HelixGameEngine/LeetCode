import React from 'react';
import { Download, Upload } from 'lucide-react';
import { createExportData, downloadFile } from '../utils/helpers';

const ImportExportButtons = ({
  categories,
  collapsedCategories,
  setCategories,
  setCollapsedCategories
}) => {
  const exportData = () => {
    const exportObject = createExportData(categories, collapsedCategories);
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const filename = `leetcode-tracker-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(blob, filename);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);

        if (Array.isArray(imported)) {
          // Legacy format support
          setCategories(imported);
          setCollapsedCategories([]);
        } else {
          // New format with metadata
          setCategories(imported.categories || []);
          setCollapsedCategories(imported.collapsedCategories || []);
        }
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-importing the same file
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
      <button
        onClick={exportData}
        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
      >
        <Download size={16} />
        Export
      </button>
      <label className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm">
        <Upload size={16} />
        Import
        <input
          type="file"
          accept=".json"
          onChange={importData}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default ImportExportButtons;
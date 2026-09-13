'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Alert } from './Alert';
import { Upload, FileText, CheckCircle, Database } from 'lucide-react';
import api from '@/lib/axios';

interface ImportWizardProps {
  entityType: string;
  expectedColumns: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export function ImportWizard({ entityType, expectedColumns, onSuccess, onCancel }: ImportWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Preview state
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // { fileColumn: expectedColumn }
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedFileId = uploadRes.data.id;
      setFileId(uploadedFileId);

      // Fetch preview
      const previewRes = await api.get(`/files/${uploadedFileId}/preview`);
      setFileColumns(previewRes.data.columns);
      setPreviewData(previewRes.data.preview);
      
      // Auto-map where possible
      const autoMap: Record<string, string> = {};
      previewRes.data.columns.forEach((col: string) => {
        const match = expectedColumns.find(e => e.toLowerCase() === col.toLowerCase());
        if (match) autoMap[col] = match;
      });
      setMapping(autoMap);
      
      setStep('preview');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'File upload failed');
    }
  };

  const handleImport = async () => {
    if (!fileId) return;
    
    // Validate mapping (ensure required columns are mapped)
    const mappedValues = Object.values(mapping);
    const missing = expectedColumns.filter(col => !mappedValues.includes(col) && col !== 'id' && col !== 'status');
    
    if (missing.length > 0) {
      setError(`Missing mapping for required columns: ${missing.join(', ')}`);
      return;
    }

    try {
      setStep('importing');
      setError(null);
      
      const res = await api.post('/files/import', {
        file_id: fileId,
        entity_type: entityType,
        column_mapping: mapping
      });
      
      setImportSummary(res.data.summary);
      setStep('complete');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Import failed');
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle>Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Data</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && <Alert variant="error" className="mb-6">{error}</Alert>}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <form onSubmit={handleFileUpload} className="space-y-6 text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 hover:bg-slate-50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 font-semibold hover:text-blue-700">Browse for a file</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-sm text-slate-500 mt-2">CSV or Excel files only. Max 10MB.</p>
                {file && <p className="mt-4 font-medium text-slate-700">Selected: {file.name}</p>}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!file}>Upload & Preview</Button>
              </div>
            </form>
          )}

          {/* STEP 2: PREVIEW & MAP */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Column Mapping</h3>
                <p className="text-sm text-slate-500 mb-4">Map your file columns to the system's expected fields.</p>
                
                <div className="grid grid-cols-2 gap-4 font-medium text-slate-700 mb-2">
                  <div>Your File Column</div>
                  <div>System Field</div>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {fileColumns.map(col => (
                    <div key={col} className="grid grid-cols-2 gap-4 items-center">
                      <div className="bg-slate-50 p-2 rounded border text-sm">{col}</div>
                      <select 
                        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={mapping[col] || ''}
                        onChange={e => setMapping({ ...mapping, [col]: e.target.value })}
                      >
                        <option value="">-- Ignore Column --</option>
                        {expectedColumns.map(exp => (
                          <option key={exp} value={exp}>{exp}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Data Preview</h3>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 bg-slate-50 border-b">
                      <tr>
                        {fileColumns.map(col => <th key={col} className="px-4 py-2">{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-b">
                          {fileColumns.map(col => <td key={col} className="px-4 py-2">{String(row[col])}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
                <Button onClick={handleImport}>Confirm & Import</Button>
              </div>
            </div>
          )}

          {/* STEP 3: IMPORTING */}
          {step === 'importing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Database className="h-12 w-12 text-blue-500 animate-pulse" />
              <h3 className="text-xl font-semibold">Importing Data...</h3>
              <p className="text-slate-500">Please wait while your records are processed and saved securely.</p>
            </div>
          )}

          {/* STEP 4: COMPLETE */}
          {step === 'complete' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-2xl font-bold text-slate-900">Import Successful!</h3>
              <div className="bg-slate-50 p-6 rounded-lg w-full max-w-md mt-4">
                <div className="flex justify-between border-b pb-2 mb-2">
                  <span className="text-slate-500">Rows Processed</span>
                  <span className="font-semibold">{importSummary?.rows_processed || 0}</span>
                </div>
                <div className="flex justify-between border-b pb-2 mb-2">
                  <span className="text-slate-500">Successfully Imported</span>
                  <span className="font-semibold text-green-600">{importSummary?.success || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Failed / Skipped</span>
                  <span className="font-semibold text-red-600">{importSummary?.failed || 0}</span>
                </div>
              </div>
              <Button className="mt-8 w-full max-w-xs" onClick={onSuccess}>Done</Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

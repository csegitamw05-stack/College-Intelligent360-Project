'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  FileText,
  FileCheck,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Search,
  Eye
} from 'lucide-react';

const TARGET_ENTITIES = [
  { id: 'students', name: 'Student Roster', fields: ['enrollment_number', 'name', 'department', 'email', 'batch'] },
  { id: 'attendance', name: 'Attendance Records', fields: ['enrollment_number', 'subject_code', 'date', 'status'] },
  { id: 'academic_performance', name: 'Academic GPAs', fields: ['enrollment_number', 'semester', 'sgpa', 'cgpa'] },
  { id: 'assessments', name: 'Assessment Scores', fields: ['subject_code', 'name', 'max_marks', 'weightage'] },
  { id: 'lab_performance', name: 'Lab Practical Scores', fields: ['enrollment_number', 'lab_name', 'experiment_name', 'marks'] },
  { id: 'placements', name: 'Placement Offers', fields: ['enrollment_number', 'company_name', 'package', 'status'] }
];

export default function FilesManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mapping & Validation State
  const [selectedFileForMapping, setSelectedFileForMapping] = useState<any | null>(null);
  const [targetEntity, setTargetEntity] = useState<string>('students');
  const [columnMapping, setColumnMapping] = useState<Record<string, str>>({});
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  // Fetch uploaded files list
  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ['uploaded_files'],
    queryFn: async () => {
      const response = await api.get('/files/list');
      return response.data;
    }
  });

  // Handle Drag & Drop Upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMsg({ type: 'success', text: `File '${res.data.original_filename}' uploaded securely and passed security validation.` });
      refetch();
    } catch (err: any) {
      setUploadMsg({ type: 'error', text: err.response?.data?.detail || 'File upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  // Preview / Map File
  const handlePreviewFile = async (fileItem: any) => {
    try {
      const res = await api.get(`/files/${fileItem.id}/preview`);
      const previewData = res.data;
      setSelectedFileForMapping({ ...fileItem, preview: previewData });

      // Auto-assign mapping defaults if columns match
      if (previewData.columns) {
        const initialMap: Record<string, string> = {};
        const targetFields = TARGET_ENTITIES.find(e => e.id === targetEntity)?.fields || [];
        previewData.columns.forEach((col: string) => {
          const colLower = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const matched = targetFields.find(f => colLower.includes(f) || f.includes(colLower));
          initialMap[col] = matched || 'ignore';
        });
        setColumnMapping(initialMap);
      }
      setValidationResult(null);
    } catch (err: any) {
      alert(`Preview Error: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Run Row Validation
  const handleRunValidation = async () => {
    if (!selectedFileForMapping) return;
    try {
      const res = await api.post('/files/validate', {
        file_id: selectedFileForMapping.id,
        entity_type: targetEntity,
        column_mapping: columnMapping
      });
      setValidationResult(res.data);
    } catch (err: any) {
      alert(`Validation Failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!selectedFileForMapping) return;
    setImporting(true);
    try {
      const res = await api.post('/files/import', {
        file_id: selectedFileForMapping.id,
        entity_type: targetEntity,
        column_mapping: columnMapping
      });
      alert(`Import Successful! ${res.data.message}`);
      setSelectedFileForMapping(null);
      setValidationResult(null);
      refetch();
    } catch (err: any) {
      alert(`Import Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Download File
  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert("Download failed.");
    }
  };

  // Delete File
  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file from private repository?")) return;
    try {
      await api.delete(`/files/${fileId}/delete`);
      refetch();
    } catch (err: any) {
      alert("Delete failed.");
    }
  };

  const files = filesData?.files || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Institutional Ingestion Station
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> MIME & Security Verified
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Data Upload & Import Station</h1>
          <p className="text-slate-300 text-sm mt-1">
            Securely upload CSV, XLSX, PDF, DOCX, TXT, JSON, PNG, or ZIP files to update campus database records.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Widget */}
      <Card className="shadow-md border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
        <CardContent className="p-8 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            accept=".csv,.xlsx,.xls,.pdf,.docx,.txt,.json,.png,.jpg,.jpeg,.zip"
          />

          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl text-blue-600 mb-4 shadow-inner">
            <UploadCloud className="h-10 w-10" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Upload Institutional Data Files</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 mb-4">
            Supports <span className="font-semibold text-slate-700">CSV, XLSX, XLS, PDF, DOCX, TXT, JSON, PNG, JPG, ZIP</span> (Max 10MB). Executable files are blocked automatically.
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/30"
          >
            {uploading ? 'Validating & Uploading...' : 'Browse & Select File'}
          </Button>

          {uploadMsg && (
            <div className="mt-4 max-w-xl mx-auto">
              <Alert variant={uploadMsg.type === 'success' ? 'success' : 'error'}>
                {uploadMsg.text}
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Mapping & Validation Wizard Modal/Card */}
      {selectedFileForMapping && (
        <Card className="shadow-lg border-2 border-blue-500 bg-slate-900 text-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-blue-400" /> Interactive Column Mapper & Data Validator
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                File: <span className="font-mono text-blue-300">{selectedFileForMapping.original_filename}</span>
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedFileForMapping(null)} className="border-slate-700 text-slate-300">
              Close Mapper
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Structured Tabular Mapper */}
            {selectedFileForMapping.preview?.file_type === 'structured' ? (
              <>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="w-full md:w-1/2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Target Entity Table</label>
                    <select
                      value={targetEntity}
                      onChange={(e) => setTargetEntity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {TARGET_ENTITIES.map(ent => (
                        <option key={ent.id} value={ent.id}>{ent.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={handleRunValidation} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 mt-4 md:mt-0">
                    <CheckCircle2 className="h-4 w-4" /> Validate Rows & Check Errors
                  </Button>
                </div>

                {/* Mapping Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Column Mapping Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedFileForMapping.preview.columns.map((col: string) => (
                      <div key={col} className="p-3 bg-slate-800 rounded-lg border border-slate-700/80 flex flex-col justify-between">
                        <span className="text-xs font-mono font-bold text-blue-300 truncate" title={col}>{col}</span>
                        <select
                          value={columnMapping[col] || 'ignore'}
                          onChange={(e) => setColumnMapping({ ...columnMapping, [col]: e.target.value })}
                          className="mt-2 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200"
                        >
                          <option value="ignore">-- Ignore Column --</option>
                          {TARGET_ENTITIES.find(e => e.id === targetEntity)?.fields.map(f => (
                            <option key={f} value={f}>Target: {f}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Summary Report */}
                {validationResult && (
                  <div className="p-5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-4">
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Validation Summary Report
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <span className="text-xs text-slate-400 block">Total Rows</span>
                        <span className="text-xl font-extrabold text-white">{validationResult.total_rows}</span>
                      </div>
                      <div className="p-3 bg-emerald-950/60 rounded-lg border border-emerald-800/40">
                        <span className="text-xs text-emerald-300 block">Valid Rows</span>
                        <span className="text-xl font-extrabold text-emerald-400">{validationResult.valid_rows_count}</span>
                      </div>
                      <div className="p-3 bg-rose-950/60 rounded-lg border border-rose-800/40">
                        <span className="text-xs text-rose-300 block">Invalid Rows</span>
                        <span className="text-xl font-extrabold text-rose-400">{validationResult.invalid_rows_count}</span>
                      </div>
                      <div className="p-3 bg-amber-950/60 rounded-lg border border-amber-800/40">
                        <span className="text-xs text-amber-300 block">Duplicates</span>
                        <span className="text-xl font-extrabold text-amber-400">{validationResult.duplicate_rows_count}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleExecuteImport}
                        disabled={importing || validationResult.valid_rows_count === 0}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-600/30"
                      >
                        {importing ? 'Importing Rows & Recalculating Analytics...' : `Confirm Import of ${validationResult.valid_rows_count} Valid Rows`}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* PDF / DOCX / Text / Image preview */
              <div className="p-5 bg-slate-800 rounded-xl space-y-3">
                <p className="text-sm text-slate-300 font-semibold">{selectedFileForMapping.preview?.message}</p>
                {selectedFileForMapping.preview?.extracted_text && (
                  <div className="p-4 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedFileForMapping.preview.extracted_text}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files Repository Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Private Institutional File Repository
          </CardTitle>
          <Badge variant="outline" className="text-xs">{files.length} Stored Files</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading private repository files...</div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No institutional files uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-lg">Filename</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3">Uploaded Date</th>
                    <th className="p-3">Import Status</th>
                    <th className="p-3 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.map((fileItem: any) => (
                    <tr key={fileItem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="truncate max-w-xs">{fileItem.original_filename}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-600">{fileItem.mime_type?.split('/')[1] || 'raw'}</td>
                      <td className="p-3 text-slate-600 text-xs font-mono">{fileItem.size_formatted}</td>
                      <td className="p-3 text-slate-700 font-medium text-xs">{fileItem.uploaded_by}</td>
                      <td className="p-3 text-slate-500 font-mono text-xs">
                        {fileItem.uploaded_at ? new Date(fileItem.uploaded_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${fileItem.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {fileItem.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewFile(fileItem)}
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview & Map
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(fileItem.id, fileItem.original_filename)}
                          className="text-xs text-slate-700 border-slate-200 hover:bg-slate-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(fileItem.id)}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

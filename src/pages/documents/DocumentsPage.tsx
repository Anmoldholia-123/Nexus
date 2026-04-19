import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { FileText, Upload, Download, Trash2, Share2, PenTool, X, Check } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface ChamberDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  lastModified: string;
}

const initialDocuments: ChamberDoc[] = [
  { id: '1', name: 'Seed Funding Term Sheet.pdf', type: 'PDF', size: '1.2 MB', status: 'In Review', lastModified: '2024-02-15' },
  { id: '2', name: 'Non-Disclosure Agreement (NDA).pdf', type: 'PDF', size: '0.8 MB', status: 'Draft', lastModified: '2024-02-14' },
  { id: '3', name: 'Founders Agreement.pdf', type: 'PDF', size: '2.4 MB', status: 'Signed', lastModified: '2024-01-20' },
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<ChamberDoc[]>(initialDocuments);
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  
  const sigPad = useRef<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'Draft' as DocStatus,
      lastModified: new Date().toISOString().split('T')[0]
    }));
    setDocuments(prev => [...newDocs, ...prev]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const getStatusColor = (status: DocStatus) => {
    switch(status) {
      case 'Draft': return 'gray';
      case 'In Review': return 'warning';
      case 'Signed': return 'success';
      default: return 'primary';
    }
  };

  const handleSignConfirm = () => {
    if (sigPad.current && sigPad.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    
    setDocuments(prev => prev.map(doc => 
      doc.id === signingDocId ? { ...doc, status: 'Signed' } : doc
    ));
    setSigningDocId(null);
  };

  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Securely manage, review, and e-sign deals and contracts.</p>
        </div>
      </div>
      
      {/* Upload Area */}
      <Card>
        <CardBody>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <input {...getInputProps()} />
            <div className="p-3 bg-primary-100 rounded-full mb-3 text-primary-600">
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select files"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports PDF, DOCX, XLSX up to 10MB</p>
          </div>
        </CardBody>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Deal Documents</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {documents.length === 0 && <p className="text-sm text-gray-500">No documents uploaded yet.</p>}
            
            {documents.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h3>
                       <Badge variant={getStatusColor(doc.status)} size="sm">{doc.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Modified {doc.lastModified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {doc.status !== 'Signed' && (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      leftIcon={<PenTool size={16} />}
                      onClick={() => setSigningDocId(doc.id)}
                    >
                      Sign
                    </Button>
                  )}
                  {doc.status === 'Signed' && (
                    <Button size="sm" variant="outline" disabled leftIcon={<Check size={16} className="text-green-600"/>}>
                      Signed
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="p-2" aria-label="Download">
                    <Download size={18} />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="p-2 text-error-600 hover:text-error-700" onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Signature Modal Overlay */}
      {signingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center"><PenTool className="mr-2 h-5 w-5 text-primary-600"/> E-Signature Required</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSigningDocId(null)}><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please draw your signature below to authorize the document: 
                <span className="font-medium text-gray-900 block mt-1">
                  {documents.find(d => d.id === signingDocId)?.name}
                </span>
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative">
                <SignatureCanvas 
                  ref={sigPad}
                  canvasProps={{ className: 'w-full h-48 rounded-lg cursor-crosshair touch-none' }} 
                  backgroundColor="rgb(249,250,251)"
                />
              </div>
              <div className="text-right mt-2">
                <button onClick={clearSignature} className="text-xs text-primary-600 hover:text-primary-800 font-medium tracking-wide">
                  Clear Signature
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSigningDocId(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSignConfirm}>Confirm & Sign</Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import { documentApi } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Trash2 } from 'lucide-react';
import {AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        } from '../ui/alert-dialog';

const DocumentManager = ({ documents, onUpload, onRefresh, onDelete}) => {
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setUploading(true);
  try {
    await documentApi.upload(file);
    onUpload();
    onRefresh();
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file. Please try again.');
  } finally {
    setUploading(false);
  }
};

const triggerFileInput = () => {
  fileInputRef.current?.click();
};

const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('text')) return '📋';
  return '📎';
};

return (
  <Card className="w-full max-w-4xl mx-auto">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Document Management</span>
        <div className="relative">
          <Button
            onClick={triggerFileInput}
            disabled={uploading}
          >
            {uploading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer overflow-hidden"
            onChange={handleFileUpload} accept= ".pdf,.txt,.doc,.docx,.md"
          />
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{doc.original_filename}</h4>
              <p className="text-sm text-muted-foreground">
                {doc.file_type} • {doc.chunk_count} chunks • {formatDate(doc.uploaded_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
        {doc.processed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <Button variant="ghost" size="icon" onClick={() => setDeleteId(doc.id)} >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  ))}
      {documents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
      )}
    </div>
    </CardContent>
    <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Document</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the document and all its chunks from the vector store.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => { onDelete(deleteId); setDeleteId(null); }}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
  </AlertDialog>
  </Card>
);};

export default DocumentManager;
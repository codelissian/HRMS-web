import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Description,
  PictureAsPdf,
  Image,
  GetApp,
  Visibility,
  Delete,
  Add,
  Upload,
} from '@mui/icons-material';
import { format } from 'date-fns';

const DocumentList = ({ employeeId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

  const loadDocuments = () => {
    try {
      const allDocuments = JSON.parse(localStorage.getItem('hrms_documents') || '[]');
      const employeeDocuments = allDocuments.filter(doc => doc.employeeId === employeeId);
      setDocuments(employeeDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleUploadDocument = () => {
    setUploadDialogOpen(true);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleDownloadDocument = (document) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = document.url || '#';
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const allDocuments = JSON.parse(localStorage.getItem('hrms_documents') || '[]');
        const updatedDocuments = allDocuments.filter(doc => doc.id !== documentId);
        localStorage.setItem('hrms_documents', JSON.stringify(updatedDocuments));
        loadDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <PictureAsPdf sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'image':
        return <Image sx={{ fontSize: 40, color: 'success.main' }} />;
      default:
        return <Description sx={{ fontSize: 40, color: 'primary.main' }} />;
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'document';
    }
  };

  const getFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Generate dummy documents if none exist
  useEffect(() => {
    if (documents.length === 0) {
      const dummyDocuments = [
        {
          id: '1',
          employeeId: employeeId,
          name: 'Aadhar Card.pdf',
          type: 'pdf',
          size: 245760, // 240 KB
          uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          category: 'Identity Proof',
          url: '#',
        },
        {
          id: '2',
          employeeId: employeeId,
          name: 'Resume.docx',
          type: 'document',
          size: 51200, // 50 KB
          uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          category: 'Professional',
          url: '#',
        },
        {
          id: '3',
          employeeId: employeeId,
          name: 'Offer Letter.pdf',
          type: 'pdf',
          size: 102400, // 100 KB
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          category: 'Employment',
          url: '#',
        },
        {
          id: '4',
          employeeId: employeeId,
          name: 'Profile Photo.jpg',
          type: 'image',
          size: 153600, // 150 KB
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          category: 'Personal',
          url: '#',
        },
      ];

      try {
        const allDocuments = JSON.parse(localStorage.getItem('hrms_documents') || '[]');
        const updatedDocuments = [...allDocuments, ...dummyDocuments];
        localStorage.setItem('hrms_documents', JSON.stringify(updatedDocuments));
        setDocuments(dummyDocuments);
      } catch (error) {
        console.error('Error initializing documents:', error);
      }
    }
  }, [employeeId, documents.length]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleUploadDocument}
        >
          Upload Document
        </Button>
      </Box>

      {documents.length > 0 ? (
        <Grid container spacing={3}>
          {documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getFileIcon(getFileType(document.name))}
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {document.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getFileSize(document.size)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={document.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded: {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDocument(document)}
                      color="info"
                      title="View"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadDocument(document)}
                      color="primary"
                      title="Download"
                    >
                      <GetApp />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDocument(document.id)}
                      color="error"
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          No documents found for this employee.
        </Alert>
      )}

      {/* Upload Document Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Upload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and drop files here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse files
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  // Handle file upload logic here
                  console.log('File selected:', e.target.files[0]);
                  setUploadDialogOpen(false);
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedDocument && getFileIcon(getFileType(selectedDocument.name))}
            <Typography variant="h6">
              {selectedDocument?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">File Name</Typography>
                  <Typography variant="body1">{selectedDocument.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{selectedDocument.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">File Size</Typography>
                  <Typography variant="body1">{getFileSize(selectedDocument.size)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Uploaded On</Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedDocument.uploadedAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Document preview would be displayed here
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedDocument && (
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => handleDownloadDocument(selectedDocument)}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList; 
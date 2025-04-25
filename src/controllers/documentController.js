const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const { supabase } = db;

// Upload document
const uploadDocument = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({ error: 'No document file provided' });
    }
    
    // Check valid entity types
    if (!['property', 'contract', 'tenant'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    // Check if entity exists
    let entityTable;
    let entityIdColumn;
    
    if (entityType === 'property') {
      entityTable = 'properties';
      entityIdColumn = 'property_id';
    } else if (entityType === 'contract') {
      entityTable = 'contracts';
      entityIdColumn = 'contract_id';
    } else {
      entityTable = 'tenants';
      entityIdColumn = 'tenant_id';
    }
    
    const { data: entity, error: entityError } = await supabase
      .from(entityTable)
      .select('*')
      .eq(entityIdColumn, entityId)
      .single();
    
    if (entityError) {
      return res.status(404).json({ error: `${entityType} not found` });
    }
    
    const file = req.file;
    const documentType = req.body.document_type || 'other';
    const documentName = req.body.document_name || file.originalname;
    const description = req.body.description || '';
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `documents/${entityType}/${entityId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-manager')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-manager')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    
    // Create document record
    const documentId = uuidv4();
    const documentData = {
      document_id: documentId,
      entity_type: entityType,
      entity_id: entityId,
      document_type: documentType,
      document_name: documentName,
      description,
      file_name: fileName,
      file_path: filePath,
      public_url: publicUrl,
      content_type: file.mimetype,
      size: file.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('documents')
      .insert([documentData]);
    
    if (insertError) throw insertError;
    
    res.status(201).json({
      document_id: documentId,
      entity_type: entityType,
      entity_id: entityId,
      document_type: documentType,
      document_name: documentName,
      description,
      public_url: publicUrl
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get documents by entity
const getDocumentsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    // Check valid entity types
    if (!['property', 'contract', 'tenant'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    // Get documents
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
};

// Get document by ID
const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to retrieve document' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Get document to delete its file
    const { data, error: findError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('document_id', documentId)
      .single();
    
    if (findError) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('property-manager')
      .remove([data.file_path]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with document deletion even if file deletion fails
    }
    
    // Delete document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', documentId);
    
    if (error) throw error;
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByEntity,
  getDocumentById,
  deleteDocument
};
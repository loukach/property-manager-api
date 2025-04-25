const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const { supabase } = db;

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Rename property_id to id in the response to follow API conventions
    const formattedProperties = data.map(property => {
      const { property_id, ...rest } = property;
      return { id: property_id, ...rest };
    });
    
    res.json(formattedProperties);
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
};

// Get a single property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Rename property_id to id in the response to follow API conventions
    const { property_id, ...rest } = data;
    const formattedProperty = { id: property_id, ...rest };
    
    res.json(formattedProperty);
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ error: 'Failed to retrieve property' });
  }
};

// Create a new property
const createProperty = async (req, res) => {
  try {
    const newProperty = {
      property_id: uuidv4(),
      name: req.body.name,
      address: req.body.address,
      property_type: req.body.property_type,
      status: req.body.status,
      monthly_rent: req.body.monthly_rent || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('properties')
      .insert([newProperty])
      .select();
    
    if (error) throw error;
    
    // Rename property_id to id in the response to follow API conventions
    const { property_id, ...rest } = data[0];
    const createdProperty = { id: property_id, ...rest };
    
    res.status(201).json(createdProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

// Update an existing property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const { data: existingProperty, error: findError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', id)
      .single();
    
    if (findError) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Update property
    const updates = {
      name: req.body.name,
      address: req.body.address,
      property_type: req.body.property_type,
      status: req.body.status,
      monthly_rent: req.body.monthly_rent || null,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('property_id', id)
      .select();
    
    if (error) throw error;
    
    // Rename property_id to id in the response to follow API conventions
    const { property_id, ...rest } = data[0];
    const updatedProperty = { id: property_id, ...rest };
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

// Delete a property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for active contracts
    const { data: activeContracts, error: contractError } = await supabase
      .from('contracts')
      .select('contract_id')
      .eq('property_id', id)
      .eq('status', 'active');
    
    if (contractError) throw contractError;
    
    if (activeContracts && activeContracts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete property with active contracts' 
      });
    }
    
    // Delete property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('property_id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

// Upload property image
const uploadPropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', id)
      .single();
    
    if (propertyError) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `property-images/${id}/${fileName}`;
    
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
    
    // Create image record
    const imageId = uuidv4();
    const imageData = {
      image_id: imageId,
      property_id: id,
      file_name: fileName,
      file_path: filePath,
      public_url: publicUrl,
      content_type: file.mimetype,
      size: file.size,
      created_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('images')
      .insert([imageData]);
    
    if (insertError) throw insertError;
    
    res.status(201).json({
      id: imageId,
      property_id: id,
      file_name: fileName,
      public_url: publicUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Get property images
const getPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', id)
      .single();
    
    if (propertyError) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Get images
    const { data, error } = await supabase
      .from('images')
      .select('image_id, file_name, public_url, created_at')
      .eq('property_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Rename image_id to id in the response
    const formattedImages = data.map(image => {
      const { image_id, ...rest } = image;
      return { id: image_id, ...rest };
    });
    
    res.json(formattedImages);
  } catch (error) {
    console.error('Error getting property images:', error);
    res.status(500).json({ error: 'Failed to retrieve property images' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  getPropertyImages
};
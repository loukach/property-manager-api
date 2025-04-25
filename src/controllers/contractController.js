const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const { supabase } = db;

// Get contracts by property ID
const getContractsByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', propertyId)
      .single();
    
    if (propertyError) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .eq('property_id', propertyId)
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    
    // Rename contract_id to id in the response to follow API conventions
    const formattedContracts = data.map(contract => {
      const { contract_id, ...rest } = contract;
      return { id: contract_id, ...rest };
    });
    
    res.json(formattedContracts);
  } catch (error) {
    console.error('Error getting contracts by property:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts for this property' });
  }
};

// Get all contracts
const getAllContracts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    
    // Rename contract_id to id in the response to follow API conventions
    const formattedContracts = data.map(contract => {
      const { contract_id, ...rest } = contract;
      return { id: contract_id, ...rest };
    });
    
    res.json(formattedContracts);
  } catch (error) {
    console.error('Error getting contracts:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
};

// Get a single contract by ID
const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .eq('contract_id', id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Rename contract_id to id in the response to follow API conventions
    const { contract_id, ...rest } = data;
    const formattedContract = { id: contract_id, ...rest };
    
    res.json(formattedContract);
  } catch (error) {
    console.error('Error getting contract:', error);
    res.status(500).json({ error: 'Failed to retrieve contract' });
  }
};

// Create a new contract
const createContract = async (req, res) => {
  try {
    const { property_id, tenant_name, start_date, end_date, monthly_rent, status } = req.body;
    
    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', property_id)
      .single();
    
    if (propertyError) {
      return res.status(400).json({ error: 'Property not found' });
    }
    
    // If status is active, check for other active contracts on same property
    if (status === 'active') {
      const { data: activeContracts, error: contractError } = await supabase
        .from('contracts')
        .select('contract_id')
        .eq('property_id', property_id)
        .eq('status', 'active');
      
      if (!contractError && activeContracts && activeContracts.length > 0) {
        return res.status(400).json({ 
          error: 'Property already has an active contract' 
        });
      }
      
      // Update property status to occupied
      await supabase
        .from('properties')
        .update({ status: 'occupied', monthly_rent, updated_at: new Date().toISOString() })
        .eq('property_id', property_id);
    }
    
    // Create new contract
    const newContract = {
      contract_id: uuidv4(),
      property_id,
      tenant_name,
      start_date,
      end_date,
      monthly_rent,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('contracts')
      .insert([newContract])
      .select('*, property:properties(name)');
    
    if (error) throw error;
    
    // Rename contract_id to id in the response to follow API conventions
    const { contract_id, ...rest } = data[0];
    const createdContract = { id: contract_id, ...rest };
    
    res.status(201).json(createdContract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
};

// Update an existing contract
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { property_id, tenant_name, start_date, end_date, monthly_rent, status } = req.body;
    
    // Check if contract exists
    const { data: existingContract, error: findError } = await supabase
      .from('contracts')
      .select('*')
      .eq('contract_id', id)
      .single();
    
    if (findError) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // If status changing to active, check for other active contracts
    if (status === 'active' && existingContract.status !== 'active') {
      const { data: activeContracts, error: contractError } = await supabase
        .from('contracts')
        .select('contract_id')
        .eq('property_id', property_id)
        .eq('status', 'active')
        .neq('contract_id', id);
      
      if (!contractError && activeContracts && activeContracts.length > 0) {
        return res.status(400).json({ 
          error: 'Property already has another active contract' 
        });
      }
      
      // Update property status to occupied
      await supabase
        .from('properties')
        .update({ status: 'occupied', monthly_rent, updated_at: new Date().toISOString() })
        .eq('property_id', property_id);
    }
    
    // If status changing from active, update property status
    if (existingContract.status === 'active' && status !== 'active') {
      await supabase
        .from('properties')
        .update({ status: 'available', updated_at: new Date().toISOString() })
        .eq('property_id', existingContract.property_id);
    }
    
    // Update contract
    const updates = {
      property_id,
      tenant_name,
      start_date,
      end_date,
      monthly_rent,
      status,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('contract_id', id)
      .select('*, property:properties(name)');
    
    if (error) throw error;
    
    // Rename contract_id to id in the response to follow API conventions
    const { contract_id, ...rest } = data[0];
    const updatedContract = { id: contract_id, ...rest };
    
    res.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
};

// Delete a contract
const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if contract exists and get its details
    const { data: existingContract, error: findError } = await supabase
      .from('contracts')
      .select('*')
      .eq('contract_id', id)
      .single();
    
    if (findError) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // If active contract, update property status
    if (existingContract.status === 'active') {
      await supabase
        .from('properties')
        .update({ status: 'available', updated_at: new Date().toISOString() })
        .eq('property_id', existingContract.property_id);
    }
    
    // Delete contract
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('contract_id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  getContractsByPropertyId,
  createContract,
  updateContract,
  deleteContract
};
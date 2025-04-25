const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const { supabase } = db;

// Get all contracts
const getAllContracts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match expected format
    const formattedContracts = data.map(contract => ({
      ...contract,
      id: contract.contract_id,
      property_name: contract.property?.name || 'Unknown'
    }));
    
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
    
    // Transform data to match expected format
    const formattedContract = {
      ...data,
      id: data.contract_id,
      property_name: data.property?.name || 'Unknown'
    };
    
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
    
    // Format response
    const createdContract = {
      ...data[0],
      id: data[0].contract_id,
      property_name: data[0].property?.name || 'Unknown'
    };
    
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
    
    // Format response
    const updatedContract = {
      ...data[0],
      id: data[0].contract_id,
      property_name: data[0].property?.name || 'Unknown'
    };
    
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
  createContract,
  updateContract,
  deleteContract
};
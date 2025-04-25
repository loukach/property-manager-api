const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Supabase connection details - Using environment variables if available
const supabaseUrl = process.env.SUPABASE_URL || 'https://trebekxaunkngjdiwppf.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWJla3hhdW5rbmdqZGl3cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODQ5NjQsImV4cCI6MjA2MTE2MDk2NH0.jIVWlsuI3wOcYNhJR6tOfkMOADpEE0pNPQXxa1dsj8M';

console.log('Using Supabase URL:', supabaseUrl);
console.log('Using Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
supabase.from('properties').select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error.message, error);
    } else {
      console.log('Supabase connected successfully, data:', data);
    }
  })
  .catch(err => {
    console.error('Supabase connection exception:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Property Manager API (Simple Supabase Version)',
    endpoints: {
      properties: '/api/properties',
      contracts: '/api/contracts'
    }
  });
});

// Properties routes
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('property_id', req.params.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ error: 'Failed to retrieve property' });
  }
});

// Contracts routes
app.get('/api/contracts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match expected format
    const formattedData = data.map(contract => ({
      ...contract,
      property_name: contract.property?.name || 'Unknown'
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Error getting contracts:', error);
    res.status(500).json({ error: 'Failed to retrieve contracts' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
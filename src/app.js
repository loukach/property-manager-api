const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const contractRoutes = require('./routes/contractRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Supabase connection details
const supabaseUrl = process.env.SUPABASE_URL || 'https://trebekxaunkngjdiwppf.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWJla3hhdW5rbmdqZGl3cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODQ5NjQsImV4cCI6MjA2MTE2MDk2NH0.jIVWlsuI3wOcYNhJR6tOfkMOADpEE0pNPQXxa1dsj8M';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
(async () => {
  try {
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    if (error) {
      console.error('Supabase connection error:', error.message);
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (err) {
    console.error('Supabase connection exception:', err);
  }
})();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow if origin includes 'lovable' or is localhost
    if (origin.includes('lovable') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simplified routes directly in app.js

// Home route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Property Manager API (Supabase)',
    version: '1.0.0',
    endpoints: {
      properties: '/api/properties',
      contracts: '/api/contracts'
    }
  });
});

// Properties routes
app.get('/api/properties', async (_req, res) => {
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
    
    // Map property_id to id for compatibility with tests
    const formattedProperty = {
      ...data,
      id: data.property_id
    };
    
    res.json(formattedProperty);
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ error: 'Failed to retrieve property' });
  }
});

// Contracts routes
app.get('/api/contracts', async (_req, res) => {
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

app.get('/api/contracts/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, property:properties(name)')
      .eq('contract_id', req.params.id)
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
});

// Redirect to Supabase storage for property images
app.get('/api/properties/:propertyId/images/:imageId', async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    
    // Get image record
    const { data: image, error } = await supabase
      .from('images')
      .select('public_url')
      .eq('property_id', propertyId)
      .eq('image_id', imageId)
      .single();
    
    if (error || !image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Redirect to Supabase storage URL
    res.redirect(image.public_url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard summary route
app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    // Total properties count
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    // Properties by type
    const { data: propertiesByTypeData } = await supabase
      .from('properties')
      .select('property_type');
    
    // Count properties by type
    const propertiesByType = (propertiesByTypeData || []).reduce((acc, property) => {
      const type = property.property_type;
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {});
    
    const propertiesByTypeArray = Object.entries(propertiesByType).map(([property_type, count]) => ({
      property_type,
      count
    }));
    
    // Properties by status
    const { data: propertiesByStatusData } = await supabase
      .from('properties')
      .select('status');
    
    // Count properties by status
    const propertiesByStatus = (propertiesByStatusData || []).reduce((acc, property) => {
      const status = property.status;
      if (!acc[status]) acc[status] = 0;
      acc[status]++;
      return acc;
    }, {});
    
    const propertiesByStatusArray = Object.entries(propertiesByStatus).map(([status, count]) => ({
      status,
      count
    }));
    
    // Occupancy rate
    let occupancyRate = 0;
    if (totalProperties && totalProperties > 0) {
      const { count: occupied } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'occupied');
      
      occupancyRate = Math.round(((occupied || 0) / totalProperties) * 100);
    }
    
    // Total monthly income
    const { data: occupiedProperties } = await supabase
      .from('properties')
      .select('monthly_rent')
      .eq('status', 'occupied');
    
    const totalMonthlyIncome = (occupiedProperties || []).reduce((sum, property) => {
      return sum + (property.monthly_rent || 0);
    }, 0);
    
    // Upcoming contract expirations
    const today = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(today.getDate() + 60);
    
    const { data: expiringContracts } = await supabase
      .from('contracts')
      .select('contract_id, end_date, tenant_name, property:properties(name)')
      .eq('status', 'active')
      .lte('end_date', sixtyDaysLater.toISOString())
      .order('end_date', { ascending: true })
      .limit(5);
    
    // Format the expiring contracts to match expected output
    const formattedExpirations = (expiringContracts || []).map(contract => ({
      contract_id: contract.contract_id,
      end_date: contract.end_date,
      tenant_name: contract.tenant_name,
      property_name: contract.property && contract.property.name ? contract.property.name : 'Unknown'
    }));
    
    // Build dashboard summary
    const summary = {
      totalProperties: totalProperties || 0,
      propertiesByType: propertiesByTypeArray,
      propertiesByStatus: propertiesByStatusArray,
      occupancyRate,
      occupiedProperties: (occupiedProperties || []).length,
      totalMonthlyRent: totalMonthlyIncome,
      totalMonthlyIncome,
      upcomingExpirations: formattedExpirations
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard summary' });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = { app, supabase };
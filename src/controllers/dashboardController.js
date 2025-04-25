const db = require('../db');

const { supabase } = db;

// Get dashboard summary data
const getDashboardSummary = async (req, res) => {
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
};

module.exports = {
  getDashboardSummary
};
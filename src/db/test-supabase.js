const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://trebekxaunkngjdiwppf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWJla3hhdW5rbmdqZGl3cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODQ5NjQsImV4cCI6MjA2MTE2MDk2NH0.jIVWlsuI3wOcYNhJR6tOfkMOADpEE0pNPQXxa1dsj8M';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // 1. Try to create a simple test table
    console.log('Creating a test table...');
    
    // First check if we can access test_table
    const { data: existingData, error: checkError } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('Test table does not exist yet or cannot be accessed:', checkError.message);
      
      // Try to insert anyway to see if the table exists but is empty
      const { data: insertData, error: insertError } = await supabase
        .from('test_table')
        .insert([
          { name: 'Test Entry', created_at: new Date().toISOString() }
        ]);
      
      if (insertError) {
        console.log('Error inserting into test table:', insertError.message);
        console.log('Error code:', insertError.code);
        
        if (insertError.code === '42P01') { // table doesn't exist error
          console.log('We need to create the table first.');
        }
      } else {
        console.log('Successfully inserted data into test table!');
      }
    } else {
      console.log('Test table exists and we can access it!');
      console.log('Existing data:', existingData);
      
      // Insert a new test entry
      const { data: insertData, error: insertError } = await supabase
        .from('test_table')
        .insert([
          { name: 'Test Entry from Node.js app', created_at: new Date().toISOString() }
        ]);
      
      if (insertError) {
        console.log('Error inserting into test table:', insertError.message);
      } else {
        console.log('Successfully inserted new data into test table!');
      }
    }
    
    // 2. Try to query from a public table that should always exist
    console.log('\nTrying to access built-in schema information...');
    
    // This SQL should work on any Postgres database to list tables
    const { data, error } = await supabase.rpc('test_connection');
    
    if (error) {
      console.error('Error calling test_connection function:', error.message);
    } else {
      console.log('Successfully called test_connection function!');
      console.log('Result:', data);
    }
    
    console.log('\nTest complete!');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSupabase();
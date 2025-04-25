const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://trebekxaunkngjdiwppf.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWJla3hhdW5rbmdqZGl3cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODQ5NjQsImV4cCI6MjA2MTE2MDk2NH0.jIVWlsuI3wOcYNhJR6tOfkMOADpEE0pNPQXxa1dsj8M';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
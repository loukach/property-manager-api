-- This file contains the SQL to create the necessary tables in Supabase
-- You can run this in the Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
    property_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    purchase_date DATE,
    purchase_price NUMERIC(12,2),
    current_value NUMERIC(12,2),
    monthly_rent NUMERIC(10,2),
    area_sqm NUMERIC(10,2),
    description TEXT,
    status VARCHAR(20) DEFAULT 'vacant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    contract_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    tenant_name VARCHAR(200) NOT NULL,
    tenant_contact VARCHAR(100),
    tenant_nif VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(10,2) NOT NULL,
    payment_day INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table (modified to use Storage references)
CREATE TABLE IF NOT EXISTS public.documents (
    document_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES contracts(contract_id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50),
    file_type VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table (modified to use Storage references)
CREATE TABLE IF NOT EXISTS public.images (
    image_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    file_name VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    is_main_image BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_property_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_contract_property ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contract_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_document_property ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_document_contract ON documents(contract_id);
CREATE INDEX IF NOT EXISTS idx_images_property ON images(property_id);

-- Create the DB functions to create tables (referenced in db-init.ts)
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.users (
      user_id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_properties_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.properties (
      property_id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      property_type VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      purchase_date DATE,
      purchase_price NUMERIC(12,2),
      current_value NUMERIC(12,2),
      monthly_rent NUMERIC(10,2),
      area_sqm NUMERIC(10,2),
      description TEXT,
      status VARCHAR(20) DEFAULT 'vacant',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_contracts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.contracts (
      contract_id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
      tenant_name VARCHAR(200) NOT NULL,
      tenant_contact VARCHAR(100),
      tenant_nif VARCHAR(50),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      monthly_rent NUMERIC(10,2) NOT NULL,
      payment_day INTEGER,
      status VARCHAR(20) DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_documents_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.documents (
      document_id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
      contract_id INTEGER REFERENCES contracts(contract_id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      document_type VARCHAR(50),
      file_type VARCHAR(50) NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_images_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.images (
      image_id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
      file_name VARCHAR(100) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      is_main_image BOOLEAN DEFAULT FALSE,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
END;
$$;

-- Set up RLS (Row Level Security) for tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users (for development/POC)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations for authenticated users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.properties FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.images FOR ALL USING (true);
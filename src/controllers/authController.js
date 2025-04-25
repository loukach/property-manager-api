const db = require('../db');

const { supabase } = db;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: data.user?.id,
        name: data.user?.user_metadata?.name,
        email: data.user?.email
      },
      token: data.session?.access_token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Use Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.user?.id,
        name: data.user?.user_metadata?.name,
        email: data.user?.email
      },
      token: data.session?.access_token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  login,
  register,
  logout
};
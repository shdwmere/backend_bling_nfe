const express = require('express');
require('dotenv').config();

const app = express();

// Parser JSON básico
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bling NFe API Backend - Simple',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
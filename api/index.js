// api/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const blingRoutes = require('../routes/bling');

const app = express();

// CORS - permitir localhost para desenvolvimento
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
  ['http://localhost:5173', 'http://localhost:3000'];

console.log('🔧 CORS Debug - Origins permitidos:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // TEMPORÁRIO: Debug - aceita qualquer origin
    console.log('🔍 Origin recebido:', origin);
    console.log('🔍 Origins permitidos:', allowedOrigins);
    
    // Permite requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // TEMPORÁRIO: Aceita qualquer origin para debug
    return callback(null, true);
    
    // Código original (comentado temporariamente)
    // if (allowedOrigins.indexOf(origin) !== -1) {
    //   callback(null, true);
    // } else {
    //   callback(new Error('Não permitido pelo CORS'));
    // }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

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

// Debug endpoint para verificar variáveis de ambiente
app.get('/debug', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    blingClientIdExists: !!process.env.CLIENT_ID,
    blingClientSecretExists: !!process.env.BLING_CLIENT_SECRET,
    blingBaseUrl: process.env.BLING_BASE_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    frontendUrl: process.env.FRONTEND_URL,
    // NUNCA mostrar os valores reais em produção
    blingClientIdFirst10: process.env.CLIENT_ID?.substring(0, 10)
  });
});

// Rotas da API Bling
app.use('/api/bling', blingRoutes);

module.exports = app;
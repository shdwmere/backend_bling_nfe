/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware para log de requisições
router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// =============================================================================
// ROTA: GET /api/bling/callback - Callback OAuth2
// =============================================================================
router.get('/callback', (req, res) => {
  const { code, state, error } = req.query;

  console.log('📥 Callback OAuth recebido:', { code, state, error });

  // Se houve erro na autorização
  if (error) {
    console.error('❌ Erro na autorização do Bling:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=authorization_failed&details=${encodeURIComponent(error)}`);
  }

  // Se não há código de autorização
  if (!code) {
    console.error('❌ Código de autorização não recebido');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=no_code`);
  }

  try {
    // Redireciona de volta para o frontend com o código
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?code=${code}${state ? `&state=${state}` : ''}`;
    console.log('✅ Redirecionando para frontend:', redirectUrl);
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Erro no callback:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=callback_failed&details=${encodeURIComponent(error.message)}`);
  }
});

// =============================================================================
// ROTA: POST /api/bling/token - Troca código por tokens
// =============================================================================
router.post('/token', async (req, res) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Código de autorização é obrigatório'
      });
    }

    console.log('🔄 Trocando código por tokens...');

    // Prepara credenciais para Basic Auth
    const credentials = `${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`;
    const credentialsB64 = Buffer.from(credentials).toString('base64');

    // Dados para trocar código por tokens
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${req.protocol}://${req.get('host')}/api/bling/callback`
    });

    // Faz requisição para obter tokens
    const response = await axios.post(
      `${process.env.BLING_BASE_URL}/oauth/token`,
      tokenData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '1.0',
          'Authorization': `Basic ${credentialsB64}`
        }
      }
    );

    console.log('✅ Tokens obtidos com sucesso');

    // Retorna os tokens para o cliente
    return res.json(response.data);

  } catch (error) {
    console.error('❌ Erro ao obter tokens:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      return res.status(error.response.status).json({
        error: 'Falha na autenticação com Bling',
        details: error.response.data?.error_description || error.response.data,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// =============================================================================
// ROTA: POST /api/bling/refresh - Renova tokens
// =============================================================================
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Refresh token é obrigatório'
      });
    }

    console.log('🔄 Renovando tokens...');

    // Dados para renovar o token
    const tokenData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: process.env.BLING_CLIENT_ID,
      client_secret: process.env.BLING_CLIENT_SECRET
    });

    // Faz requisição para renovar tokens
    const response = await axios.post(
      `${process.env.BLING_BASE_URL}/oauth/token`,
      tokenData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Tokens renovados com sucesso');

    // Retorna os novos tokens para o cliente
    return res.json(response.data);

  } catch (error) {
    console.error('❌ Erro ao renovar token:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      return res.status(error.response.status).json({
        error: 'Falha ao renovar token',
        details: error.response.data?.error_description || error.response.data,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// =============================================================================
// ROTA: POST /api/bling/test-nfe - Testa conexão listando NFes
// =============================================================================
router.post('/test-nfe', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: 'Access token é obrigatório'
      });
    }

    console.log('🧪 Testando conexão com API Bling...');

    // Faz requisição para a API do Bling via servidor (sem CORS)
    const response = await axios.get(
      `${process.env.BLING_BASE_URL}/nfe`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Teste de conexão bem-sucedido');

    // Retorna os dados da API do Bling
    return res.json(response.data);

  } catch (error) {
    console.error('❌ Erro ao testar API NFe:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      return res.status(error.response.status).json({
        error: 'Falha na requisição para API Bling',
        details: error.response.data?.error || error.response.data,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// =============================================================================
// ROTA: POST /api/bling/create-nfe - Cria NFe com dados completos
// =============================================================================
router.post('/create-nfe', async (req, res) => {
  try {
    const { access_token, nfeData } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: 'Access token é obrigatório'
      });
    }

    if (!nfeData || !nfeData.numeroDocumento || !nfeData.nome || !nfeData.nomeProduto || !nfeData.valor) {
      return res.status(400).json({
        error: 'Dados obrigatórios: nome, documento, produto e valor'
      });
    }

    console.log('📝 Criando NFe com dados completos...');

    // Gera código único para evitar conflitos
    const timestamp = Date.now();
    const codigoProduto = `PROD_${timestamp}`;

    // Busca o maior número de NFe existente
    let proximoNumero = 500; // Fallback maior para evitar conflitos
    
    try {
      console.log('🔍 Buscando todas as NFes para encontrar o maior número...');
      const listaNfes = await axios.get(
        `${process.env.BLING_BASE_URL}/nfe?limite=100`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Encontra o maior número entre todas as NFes
      if (listaNfes.data?.data && listaNfes.data.data.length > 0) {
        const numeros = listaNfes.data.data
          .map((nfe) => parseInt(nfe.numero || '0'))
          .filter((num) => !isNaN(num));
        
        if (numeros.length > 0) {
          const maiorNumero = Math.max(...numeros);
          proximoNumero = maiorNumero + 1;
          console.log(`🔢 Maior número encontrado: ${maiorNumero}, próximo será: ${proximoNumero}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar NFes, usando fallback:', error.message);
      proximoNumero = 200 + parseInt(timestamp.toString().slice(-3));
    }

    // Estrutura completa da NFe baseada no JSON fornecido
    const nfePayload = {
      numero: proximoNumero,
      dataOperacao: new Date().toISOString().split('T')[0],
      tipo: 1, // Saída
      situacao: 1, // Em digitação (rascunho)
      
      // Dados completos do cliente
      contato: {
        nome: nfeData.nome,
        tipoPessoa: nfeData.tipoPessoa,
        numeroDocumento: nfeData.numeroDocumento.replace(/\D/g, ''),
        ie: nfeData.inscricaoEstadual || '',
        contribuinte: nfeData.contribuinte,
        telefone: nfeData.telefone || '',
        email: nfeData.email || '',
        endereco: {
          endereco: nfeData.endereco,
          bairro: nfeData.bairro,
          municipio: nfeData.cidade,
          numero: nfeData.numero || 'S/N',
          complemento: nfeData.complemento || '',
          cep: nfeData.cep.replace(/\D/g, ''),
          uf: nfeData.uf,
          pais: 'Brasil'
        }
      },

      // Item da nota
      itens: [
        {
          codigo: codigoProduto,
          descricao: nfeData.nomeProduto,
          unidade: "UN",
          quantidade: 1,
          valor: nfeData.valor,
          
          // Dados básicos do produto
          item: {
            codigo: codigoProduto,
            descricao: nfeData.nomeProduto,
            tipo: "P",
            situacao: "A",
            unidade: "UN",
            preco: nfeData.valor,
            classificacaoFiscal: "00000000"
          }
        }
      ],

      observacoes: `NFe criada automaticamente\nCliente: ${nfeData.nome}\nProduto: ${nfeData.nomeProduto}\nValor: R$ ${nfeData.valor.toFixed(2)}`
    };

    console.log('📦 Payload NFe completo preparado');

    // Faz requisição para criar NFe no Bling
    const response = await axios.post(
      `${process.env.BLING_BASE_URL}/nfe`,
      nfePayload,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ NFe criada com sucesso no Bling');

    // Retorna dados da NFe criada
    return res.json({
      success: true,
      message: 'NFe criada com sucesso com dados completos!',
      data: response.data,
      nfeInfo: {
        cliente: nfeData.nome,
        documento: nfeData.numeroDocumento,
        produto: nfeData.nomeProduto,
        valor: nfeData.valor,
        numero: proximoNumero
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar NFe:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      return res.status(error.response.status).json({
        error: 'Falha ao criar NFe no Bling',
        details: error.response.data,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
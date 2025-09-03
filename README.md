# 🚀 Bling NFe Backend API

Backend Express.js para integração com a API do Bling para emissão de Notas Fiscais Eletrônicas.

## 📋 Funcionalidades

- ✅ **Autenticação OAuth2** com Bling
- ✅ **Renovação automática** de tokens
- ✅ **Criação de NFe** com dados fiscais completos
- ✅ **Numeração automática** de notas
- ✅ **Teste de conexão** com API Bling
- ✅ **CORS configurado** para frontend Vite/React
- ✅ **Deploy na Vercel** pronto

## 🛠️ Instalação Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Rodar em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

## 🌐 Deploy na Vercel

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Fazer deploy
```bash
# Na pasta backend/
vercel

# Configurar variáveis de ambiente na Vercel
vercel env add CLIENT_ID
vercel env add BLING_CLIENT_SECRET
vercel env add BLING_BASE_URL
vercel env add ALLOWED_ORIGINS
```

### 3. Configurar variáveis de ambiente na Vercel:
- `CLIENT_ID`: Seu Client ID do Bling
- `BLING_CLIENT_SECRET`: Seu Client Secret do Bling  
- `BLING_BASE_URL`: https://bling.com.br/Api/v3
- `ALLOWED_ORIGINS`: URLs do seu frontend (separadas por vírgula)

## 📡 Endpoints da API

### Health Check
- `GET /` - Status da API
- `GET /health` - Health check detalhado

### Autenticação Bling
- `GET /api/bling/callback` - Callback OAuth2
- `POST /api/bling/token` - Trocar código por tokens
- `POST /api/bling/refresh` - Renovar tokens

### NFe Operations  
- `POST /api/bling/test-nfe` - Testar conexão (listar NFes)
- `POST /api/bling/create-nfe` - Criar NFe com dados completos

## 📤 Exemplo de uso - Criar NFe

```javascript
const response = await fetch('https://sua-api.vercel.app/api/bling/create-nfe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    access_token: 'seu_access_token_aqui',
    nfeData: {
      // Dados do cliente
      nome: 'EMPRESA TESTE LTDA',
      fantasia: 'Empresa Teste',
      tipoPessoa: 'J',
      numeroDocumento: '12.345.678/0001-90',
      inscricaoEstadual: '123456789',
      contribuinte: 1,
      
      // Endereço
      cep: '01234-567',
      uf: 'SP',
      cidade: 'São Paulo',
      bairro: 'Centro',
      endereco: 'Rua Teste',
      numero: '123',
      complemento: 'Sala 1',
      
      // Contato
      telefone: '(11) 1234-5678',
      celular: '(11) 99999-9999',
      email: 'teste@empresa.com',
      
      // Produto
      nomeProduto: 'Produto Teste',
      valor: 100.00
    }
  })
});
```

## 🔧 Configuração no Frontend

No seu projeto Vite, configure a URL base da API:

```javascript
// src/lib/bling-api.js
const API_BASE_URL = 'https://sua-api.vercel.app';

// Trocar todas as chamadas de '/api/bling' para '${API_BASE_URL}/api/bling'
```

## 📊 Logs e Monitoramento

- Logs detalhados de todas as operações
- Health check para monitoramento
- Tratamento de erros com stack traces em desenvolvimento

## 🔒 Segurança

- ✅ Helmet.js para headers de segurança
- ✅ CORS configurado corretamente
- ✅ Validação de dados de entrada
- ✅ Rate limiting (via Vercel)
- ✅ Variáveis de ambiente protegidas

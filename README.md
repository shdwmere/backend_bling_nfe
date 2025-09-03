# 🚀 Bling NFe Backend API

Backend Express.js serverless para integração segura com a API do Bling, permitindo que qualquer aplicação frontend consuma a API de NFe sem problemas de CORS.

## ✨ **Principais Features**

- ✅ **OAuth2 Flow Completo** - Autenticação segura com Bling
- ✅ **Múltiplos Produtos** - Suporte a NFe com vários itens
- ✅ **Numeração Inteligente** - Busca automática do próximo número
- ✅ **Interface Completa** - Frontend React incluído
- ✅ **CORS Configurado** - Funciona com qualquer frontend
- ✅ **Serverless Vercel** - Deploy simples e escalável
- ✅ **Totalmente Documentado** - Guia completo de implementação

## 🚀 **Quick Start**

### **1. Clone e Instale**
```bash
git clone <seu-repositorio>
cd backend_bling_nfe

# Backend
npm install

# Frontend (opcional - para testes)
cd frontend && npm install
```

### **2. Configure as Variáveis**
Crie `.env` na raiz com:
```bash
BLING_CLIENT_ID=seu_client_id_aqui
BLING_CLIENT_SECRET=seu_client_secret_aqui
BLING_BASE_URL=https://bling.com.br/Api/v3
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### **3. Teste Local**
```bash
# Backend na porta 3001
npm run dev

# Frontend na porta 5173 (opcional)
cd frontend && npm run dev
```

## 🌐 **Deploy na Vercel**

### **1. Deploy via CLI**
```bash
npm i -g vercel
vercel --prod
```

### **2. Configure as Variáveis na Vercel**
No painel Vercel → Settings → Environment Variables:

| Variável | Valor |
|----------|-------|
| `BLING_CLIENT_ID` | Seu Client ID do Bling |
| `BLING_CLIENT_SECRET` | Seu Client Secret do Bling |
| `BLING_BASE_URL` | `https://bling.com.br/Api/v3` |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://seu-frontend.com` |
| `FRONTEND_URL` | URL do seu frontend |

### **3. Configure no Painel do Bling**
- **Redirect URI:** `https://seu-backend.vercel.app/api/bling/callback`
- **Client ID:** Use nas variáveis de ambiente
- **Client Secret:** Use nas variáveis de ambiente

## 📡 **API Endpoints**

### **🔍 Health Check**
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Status básico da API |
| `/health` | GET | Health check detalhado |
| `/debug` | GET | Debug de variáveis (dev) |

### **🔐 Autenticação OAuth2**
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/bling/callback` | GET | Callback do Bling OAuth |
| `/api/bling/token` | POST | Trocar código por tokens |
| `/api/bling/refresh` | POST | Renovar tokens expirados |

### **📄 Operações NFe**  
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/bling/test-nfe` | POST | Testar conexão (listar NFes) |
| `/api/bling/create-nfe` | POST | **Criar NFe com múltiplos produtos** |

## 📤 **Exemplos de Uso**

### **🚀 Autenticação OAuth2**
```javascript
// 1. Redirecionar para autorização
const authUrl = `https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}`
window.location.href = authUrl

// 2. Capturar código do callback
const code = new URLSearchParams(window.location.search).get('code')

// 3. Trocar código por tokens
const tokens = await fetch('https://sua-api.vercel.app/api/bling/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, state: 'default_state' })
})
```

### **📄 Criar NFe com Múltiplos Produtos**
```javascript
const response = await fetch('https://sua-api.vercel.app/api/bling/create-nfe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'seu_access_token',
    nfeData: {
      // Dados do Cliente
      nome: 'EMPRESA TESTE LTDA',
      numeroDocumento: '12.345.678/0001-90',
      tipoPessoa: 'J',
      contribuinte: 1,
      
      // Endereço
      cep: '01234-567',
      uf: 'SP', 
      cidade: 'São Paulo',
      bairro: 'Centro',
      endereco: 'Rua Teste',
      numero: '123',
      
      // Contato
      telefone: '(11) 1234-5678',
      email: 'teste@empresa.com',
      
      // ⭐ MÚLTIPLOS PRODUTOS
      produtos: [
        {
          nome: 'Produto A',
          valor: 100.00,
          quantidade: 2,
          unidade: 'UN'
        },
        {
          nome: 'Produto B',
          valor: 50.00,
          quantidade: 5,
          unidade: 'PC'  
        }
      ]
    }
  })
})

const result = await response.json()
console.log('NFe criada:', result)
```

## 🎨 **Frontend Completo Incluído**

Este projeto inclui um **frontend React completo** na pasta `/frontend`:

```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### **Features da Interface:**
- ✅ **Autenticação OAuth2** visual com status
- ✅ **Modal com 4 abas:** Cliente, Endereço, Contato, Produtos  
- ✅ **Múltiplos produtos:** Adicionar/remover dinamicamente
- ✅ **Cálculos automáticos:** Total por produto e total geral
- ✅ **Validação completa:** Campos obrigatórios
- ✅ **Design profissional:** Dark theme responsivo

### **Integração em Qualquer Frontend:**
```javascript
// Configure apenas a URL da sua API
const API_BASE_URL = 'https://sua-api.vercel.app'

// Use os endpoints normalmente
const tokens = await fetch(`${API_BASE_URL}/api/bling/token`, {...})
```

## 🏗️ **Arquitetura**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Bling API     │
│   (Qualquer)    │───▶│   (Vercel)       │───▶│   (OAuth2)      │
│                 │    │                  │    │                 │
│ React/Vue/Next  │    │ Express.js       │    │ NFe Creation    │
│ Angular/Svelte  │    │ Serverless       │    │ Products API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛡️ **Recursos de Segurança**

- ✅ **CORS Configurado** - Apenas origens permitidas
- ✅ **OAuth2 Flow** - Autenticação segura com Bling  
- ✅ **Validação Robusta** - Dados de entrada validados
- ✅ **Rate Limiting** - Proteção via Vercel
- ✅ **Headers Seguros** - Configurações de segurança
- ✅ **Variáveis Protegidas** - Credenciais em ambiente

## 📊 **Monitoramento**

- 🔍 **Logs Detalhados** - Todas operações logadas
- 📈 **Health Check** - `/health` para monitoramento  
- 🐛 **Debug Endpoint** - `/debug` para troubleshooting
- ⚡ **Error Handling** - Respostas estruturadas

## 📚 **Documentação Completa**

- 📋 **[descricao.md](descricao.md)** - Guia completo de implementação
- 🚀 **[CLAUDE.md](CLAUDE.md)** - Log de desenvolvimento
- 💻 **Frontend incluído** - Exemplo funcional completo
- 🔧 **Múltiplos exemplos** - React, Vue, JavaScript vanilla

## 📞 **Suporte**

- **Issues:** Reporte bugs ou sugestões
- **Docs:** Consulte `descricao.md` para guia completo
- **Debug:** Use endpoint `/debug` para troubleshooting

Made and mantained by Shdw with ❤️
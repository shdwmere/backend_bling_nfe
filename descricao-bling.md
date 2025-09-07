# 🚀 Bling NFe Backend API

Backend Express.js serverless para integração segura com a API do Bling, permitindo que qualquer aplicação frontend consuma a API de NFe sem problemas de CORS.

## ✨ Principais Features

- ✅ **OAuth2 Flow Completo** - Autenticação segura com Bling
- ✅ **Múltiplos Produtos** - Suporte a NFe com vários itens
- ✅ **Numeração Inteligente** - Busca automática do próximo número
- ✅ **Interface Completa** - Frontend React incluído
- ✅ **CORS Configurado** - Funciona com qualquer frontend
- ✅ **Serverless Vercel** - Deploy simples e escalável

## 🚀 Quick Start

```bash
git clone <repositorio>
cd backend_bling_nfe && npm install
cd frontend && npm install

# Configure .env com suas credenciais do Bling
npm run dev  # Backend: 3001, Frontend: 5173
```

## 📡 API Endpoints

### Autenticação OAuth2
- `GET /api/bling/callback` - Callback do Bling OAuth
- `POST /api/bling/token` - Trocar código por tokens
- `POST /api/bling/refresh` - Renovar tokens

### Operações NFe
- `POST /api/bling/test-nfe` - Testar conexão
- `POST /api/bling/create-nfe` - **Criar NFe com múltiplos produtos**

## 📄 Exemplo - Criar NFe

```javascript
const response = await fetch('https://sua-api.vercel.app/api/bling/create-nfe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    access_token: 'seu_token',
    nfeData: {
      nome: 'EMPRESA TESTE LTDA',
      numeroDocumento: '12.345.678/0001-90',
      tipoPessoa: 'J',
      cep: '01234-567',
      uf: 'SP',
      cidade: 'São Paulo',
      endereco: 'Rua Teste',
      telefone: '(11) 1234-5678',
      email: 'teste@empresa.com',
      
      // Múltiplos produtos
      produtos: [
        { nome: 'Produto A', valor: 100.00, quantidade: 2, unidade: 'UN' },
        { nome: 'Produto B', valor: 50.00, quantidade: 5, unidade: 'PC' }
      ]
    }
  })
})
```

## 🌐 Deploy na Vercel

```bash
npm i -g vercel
vercel --prod
```

Configure as variáveis no painel Vercel:
- `BLING_CLIENT_ID`, `BLING_CLIENT_SECRET`
- `BLING_BASE_URL=https://bling.com.br/Api/v3`
- `ALLOWED_ORIGINS=http://localhost:5173,https://seu-frontend.com`

No painel do Bling configure:
- **Redirect URI:** `https://seu-backend.vercel.app/api/bling/callback`

## 🎨 Frontend Incluído

Interface React completa com:
- ✅ Autenticação OAuth2 visual
- ✅ Modal com 4 abas (Cliente, Endereço, Contato, Produtos)
- ✅ Múltiplos produtos com cálculo automático
- ✅ Design profissional responsivo

## 🛡️ Segurança

- CORS configurado corretamente
- OAuth2 flow seguro
- Validação de dados completa
- Variáveis de ambiente protegidas

**Sistema completo e pronto para produção!**
# 📋 Backend API Bling NFe - Documentação Completa

## 🎯 **Visão Geral**

Este backend foi desenvolvido como um **intermediário seguro** entre aplicações frontend e a API do Bling, resolvendo problemas de CORS e centralizando a autenticação OAuth2. Desenvolvido em Express.js e hospedado na Vercel como função serverless.

---

## 🏗️ **Arquitetura**

### **Stack Tecnológica:**
- **Backend:** Node.js + Express.js
- **Deploy:** Vercel Serverless Functions
- **Autenticação:** OAuth2 com Bling API v3
- **Segurança:** CORS configurado + Headers seguros

### **Estrutura do Projeto:**
```
backend_bling_nfe/
├── api/
│   └── index.js     # Função serverless principal
├── routes/
│   └── bling.js           # Rotas da API Bling
├── frontend/              # Frontend de exemplo (Vite React)
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── NFeModal.jsx   # Modal de criação de NFe
│   │   └── *.css          # Estilos
│   └── package.json
├── package.json           # Dependências do backend
├── vercel.json           # Configuração da Vercel
├── .env                  # Variáveis de ambiente
└── CLAUDE.md             # Documentação de desenvolvimento
```

---

## 🔧 **Endpoints Disponíveis**

### **🔐 Autenticação OAuth2**

#### **GET /api/bling/callback**
- **Descrição:** Recebe callback do Bling após autorização
- **Parâmetros Query:**
  - `code` - Código de autorização do Bling
  - `state` - Estado para validação
  - `error` - Erro (se houver)
- **Resposta:** Redireciona para frontend com código

#### **POST /api/bling/token**
- **Descrição:** Troca código de autorização por tokens de acesso
- **Body:**
  ```json
  {
    "code": "codigo_de_autorizacao",
    "state": "default_state"
  }
  ```
- **Resposta:**
  ```json
  {
    "access_token": "token_de_acesso",
    "expires_in": 21600,
    "token_type": "Bearer",
    "scope": "escopo_permissoes",
    "refresh_token": "token_renovacao"
  }
  ```

#### **POST /api/bling/refresh**
- **Descrição:** Renova tokens expirados
- **Body:**
  ```json
  {
    "refresh_token": "token_de_renovacao"
  }
  ```

### **📄 Operações NFe**

#### **POST /api/bling/test-nfe**
- **Descrição:** Testa conexão listando NFes existentes
- **Body:**
  ```json
  {
    "access_token": "token_de_acesso"
  }
  ```

#### **POST /api/bling/create-nfe**
- **Descrição:** Cria NFe com dados fiscais completos
- **Body:**
  ```json
  {
    "access_token": "token_de_acesso",
    "nfeData": {
      // Dados do Cliente
      "nome": "RAZÃO SOCIAL DA EMPRESA",
      "numeroDocumento": "00.000.000/0001-00",
      "tipoPessoa": "J",
      "contribuinte": 1,
      "inscricaoEstadual": "123456789",
      
      // Dados do Endereço
      "endereco": "Rua Example",
      "bairro": "Centro",
      "cidade": "Rio de Janeiro",
      "numero": "123",
      "complemento": "Sala 1",
      "cep": "20000-000",
      "uf": "RJ",
      
      // Dados de Contato
      "telefone": "(21) 3234-5678",
      "email": "contato@empresa.com",
      
      // Produtos (suporte a múltiplos)
      "produtos": [
        {
          "nome": "Produto Exemplo 1",
          "valor": 100.50,
          "quantidade": 2,
          "unidade": "UN"
        },
        {
          "nome": "Produto Exemplo 2",
          "valor": 50.00,
          "quantidade": 1,
          "unidade": "PC"
        }
      ]
      
      // OU produto único (compatibilidade)
      "nomeProduto": "Produto Único",
      "valor": 100.00
    }
  }
  ```

### **🔍 Utilitários**

#### **GET /**
- **Descrição:** Health check básico
- **Resposta:**
  ```json
  {
    "message": "Bling NFe API Backend - Simple",
    "status": "running",
    "version": "1.0.0",
    "timestamp": "2025-01-03T..."
  }
  ```

#### **GET /debug**
- **Descrição:** Debug de variáveis de ambiente (desenvolvimento)
- **Resposta:** Status das configurações

---

## ⚙️ **Configuração e Deploy**

### **Variáveis de Ambiente Necessárias:**

No painel da **Vercel** → Settings → Environment Variables:

```bash
BLING_CLIENT_ID=seu_client_id_aqui
BLING_CLIENT_SECRET=seu_client_secret_aqui
BLING_BASE_URL=https://bling.com.br/Api/v3
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://seu-frontend.com
FRONTEND_URL=http://localhost:5173
```

### **Deploy na Vercel:**

1. **Via CLI:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Via GitHub:** Conecte repositório no painel da Vercel

### **Configuração no Painel do Bling:**

- **Redirect URI:** `https://seu-backend.vercel.app/api/bling/callback`
- **Client ID:** Configure nas variáveis de ambiente
- **Client Secret:** Configure nas variáveis de ambiente

---

## 💻 **Implementação no Frontend**

### **1. Configuração Básica**

```javascript
// Configuração da API
const API_BASE_URL = 'https://seu-backend.vercel.app'
const BLING_CLIENT_ID = 'seu_client_id'

// Estados necessários
const [connected, setConnected] = useState(false)
const [tokenInfo, setTokenInfo] = useState(null)
const [loading, setLoading] = useState(false)
```

### **2. Fluxo de Autenticação OAuth2**

```javascript
// Redirecionar para autorização
const handleConnect = () => {
  const redirectUri = `${API_BASE_URL}/api/bling/callback`
  const state = 'default_state'
  
  const authUrl = `https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${BLING_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  
  window.location.href = authUrl
}

// Capturar código do callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')

  if (error) {
    alert('Erro na autorização: ' + error)
    return
  }

  if (code && !connected) {
    // Evitar processamento duplicado
    const lastProcessedCode = localStorage.getItem('lastProcessedCode')
    if (lastProcessedCode === code) return
    
    localStorage.setItem('lastProcessedCode', code)
    exchangeCodeForTokens(code)
  }
}, [])

// Trocar código por tokens
const exchangeCodeForTokens = async (code) => {
  setLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/bling/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state: 'default_state' })
    })

    const tokens = await response.json()
    setTokenInfo(tokens)
    setConnected(true)
    
    // Limpar URL
    window.history.replaceState({}, document.title, window.location.pathname)
  } catch (error) {
    alert('Erro ao obter tokens: ' + error.message)
  }
  setLoading(false)
}
```

### **3. Testar Conexão**

```javascript
const handleTestAPI = async () => {
  if (!tokenInfo) return

  setLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/bling/test-nfe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: tokenInfo.access_token })
    })

    const result = await response.json()
    console.log('Resultado do teste:', result)
  } catch (error) {
    console.error('Erro no teste:', error)
  }
  setLoading(false)
}
```

### **4. Criar NFe com Múltiplos Produtos**

```javascript
const handleCreateNFe = async (nfeData) => {
  if (!tokenInfo) return

  setLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/api/bling/create-nfe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokenInfo.access_token,
        nfeData: nfeData
      })
    })

    const result = await response.json()
    console.log('NFe criada:', result)
  } catch (error) {
    console.error('Erro ao criar NFe:', error)
  }
  setLoading(false)
}

// Exemplo de dados para NFe com múltiplos produtos
const exemploNFeData = {
  // Cliente
  nome: "EMPRESA EXEMPLO LTDA",
  numeroDocumento: "12.345.678/0001-90",
  tipoPessoa: "J",
  contribuinte: 1,
  
  // Endereço
  endereco: "Rua Exemplo",
  bairro: "Centro",
  cidade: "Rio de Janeiro",
  numero: "123",
  cep: "20000-000",
  uf: "RJ",
  
  // Contato
  telefone: "(21) 3234-5678",
  email: "contato@empresa.com",
  
  // Múltiplos Produtos
  produtos: [
    {
      nome: "Produto A",
      valor: 100.00,
      quantidade: 2,
      unidade: "UN"
    },
    {
      nome: "Produto B", 
      valor: 50.00,
      quantidade: 5,
      unidade: "PC"
    }
  ]
}
```

---

## 🎨 **Interface de Exemplo**

O projeto inclui um frontend completo em **React + Vite** com:

### **Componentes Principais:**
- **App.jsx** - Interface principal com OAuth
- **NFeModal.jsx** - Modal para criação de NFe
- **Estilos CSS** - Design profissional dark theme

### **Recursos da Interface:**
- ✅ **Autenticação OAuth2** visual com status
- ✅ **Modal com 4 abas:** Cliente, Endereço, Contato, Produtos
- ✅ **Múltiplos produtos:** Adicionar/remover dinamicamente
- ✅ **Cálculos automáticos:** Total por produto e total geral
- ✅ **Validação completa:** Campos obrigatórios
- ✅ **Responsivo:** Funciona em desktop e mobile
- ✅ **Estados de loading:** Feedback visual

### **Como Usar a Interface:**
1. Instale as dependências: `cd frontend && npm install`
2. Configure a URL da API no `App.jsx`
3. Execute: `npm run dev`
4. Acesse: `http://localhost:5173`

---

## 🛡️ **Recursos de Segurança**

### **CORS Configurado:**
- Permite apenas origens específicas
- Headers necessários para requisições POST
- Suporte a credenciais quando necessário

### **Validações:**
- ✅ Código de autorização único (evita reuso)
- ✅ Tokens de acesso validados
- ✅ Dados obrigatórios verificados
- ✅ Valores numéricos validados

### **Tratamento de Erros:**
- ✅ Logs detalhados no servidor
- ✅ Respostas estruturadas para o frontend
- ✅ Mensagens de erro apropriadas
- ✅ Fallbacks para casos de erro

---

## 🚀 **Features Avançadas**

### **Numeração Automática Inteligente:**
- Busca automaticamente o último número de NFe
- Incrementa +1 para evitar conflitos
- Fallbacks robustos em caso de erro

### **Suporte a Múltiplos Produtos:**
- Interface para adicionar/remover produtos
- Validação individual por produto
- Cálculo automático de totais
- Códigos únicos por produto na API

### **Compatibilidade Dupla:**
- Suporte a NFe de produto único (legado)
- Suporte a NFe de múltiplos produtos (novo)
- Mantém compatibilidade com integrações existentes

---

## 📊 **Monitoramento e Debug**

### **Logs Detalhados:**
```
🔄 Trocando código por tokens...
✅ Tokens obtidos com sucesso
📝 Criando NFe com dados completos...
🔢 Maior número encontrado: 145, próximo será: 146
📦 Payload NFe completo preparado
✅ NFe criada com sucesso no Bling
```

### **Endpoint de Debug:**
- **GET /debug** - Verifica variáveis de ambiente
- Útil para troubleshooting de configuração
- Não expõe valores sensíveis

### **Tratamento de Rate Limits:**
- Adequado para uso em produção
- Resposta apropriada a limites da API Bling

---

## 📝 **Exemplos de Uso**

### **Integração Simples:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Teste Bling API</title>
</head>
<body>
  <button onclick="conectarBling()">Conectar com Bling</button>
  <button onclick="criarNFe()">Criar NFe</button>
  
  <script>
    const API_BASE = 'https://seu-backend.vercel.app'
    let tokens = null
    
    function conectarBling() {
      window.location.href = `https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=${API_BASE}/api/bling/callback`
    }
    
    async function criarNFe() {
      // Implementar criação de NFe
    }
  </script>
</body>
</html>
```

### **Integração React/Next.js:**
Use os exemplos de código fornecidos na seção "Implementação no Frontend"

### **Integração Vue.js:**
```javascript
// Similar ao React, adaptando sintaxe do Vue
export default {
  data() {
    return {
      connected: false,
      tokenInfo: null,
      loading: false
    }
  },
  methods: {
    async connectBling() {
      // Implementar fluxo OAuth
    }
  }
}
```

---

## 🔄 **Renovação de Tokens**

```javascript
const renewTokens = async () => {
  if (!tokenInfo?.refresh_token) return

  try {
    const response = await fetch(`${API_BASE_URL}/api/bling/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokenInfo.refresh_token })
    })

    const newTokens = await response.json()
    setTokenInfo(newTokens)
  } catch (error) {
    console.error('Erro ao renovar tokens:', error)
    // Redirecionar para nova autenticação
    setConnected(false)
    setTokenInfo(null)
  }
}
```

---

## ❓ **FAQ**

### **Q: Como configurar para diferentes ambientes?**
**A:** Use diferentes URLs no `ALLOWED_ORIGINS` e `FRONTEND_URL` para desenvolvimento, staging e produção.

### **Q: O que fazer se os tokens expirarem?**
**A:** Use o endpoint `/api/bling/refresh` com o `refresh_token` para obter novos tokens.

### **Q: Como adicionar mais campos na NFe?**
**A:** Modifique o `nfePayload` em `/routes/bling.js` seguindo a documentação da API do Bling.

### **Q: É possível usar com outros frameworks?**
**A:** Sim! O backend é agnóstico. Funciona com qualquer frontend que faça requisições HTTP.

### **Q: Como debug problemas de CORS?**
**A:** Verifique se o domínio do frontend está em `ALLOWED_ORIGINS` e se as variáveis foram atualizadas na Vercel.

---

## 📞 **Suporte**

- **Logs:** Acesse painel da Vercel → Functions → View Function Logs
- **Debug:** Use endpoint `/debug` para verificar configurações
- **Testes:** Use `/health` para verificar se a API está online

---

**Desenvolvido com ❤️ por Claude - Anthropic**  
*Sistema completo e pronto para produção!* 🚀
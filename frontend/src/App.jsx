import { useState, useEffect } from 'react'
import './App.css'
import NFeModal from './NFeModal'

function App() {
  const [connected, setConnected] = useState(false)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showNFeModal, setShowNFeModal] = useState(false)

  // URL da sua API na Vercel (substitua pela URL real do deploy)
  const API_BASE_URL = 'https://backend-bling-nfe.vercel.app' // Para teste local ou sua URL da Vercel

  const handleConnect = () => {
    // Limpa código processado anteriormente
    localStorage.removeItem('lastProcessedCode')
    
    // Redireciona para a página de autorização do Bling
    const clientId = '40f4dc7c6b9be201808cb9ab54d7e1894e850d55'
    const redirectUri = `${API_BASE_URL}/api/bling/callback`
    const state = 'default_state'
    
    const authUrl = `https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
    
    window.location.href = authUrl
  }

  const handleDisconnect = () => {
    setConnected(false)
    setTokenInfo(null)
    setTestResult(null)
    // Limpa código processado
    localStorage.removeItem('lastProcessedCode')
  }

  const handleTestAPI = async () => {
    if (!tokenInfo) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/bling/test-nfe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenInfo.access_token
        })
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.message })
    }
    setLoading(false)
  }

  const handleCreateNFe = async (nfeData) => {
    if (!tokenInfo) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/bling/create-nfe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenInfo.access_token,
          nfeData: nfeData
        })
      })

      const result = await response.json()
      setTestResult(result)
      setShowNFeModal(false) // Fecha o modal após criação
    } catch (error) {
      setTestResult({ error: error.message })
    }
    setLoading(false)
  }

  // Verifica se há código de autorização na URL (após callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      alert('Erro na autorização: ' + error)
      return
    }

    if (code && !connected && !loading) {
      // Verifica se este código já foi processado
      const lastProcessedCode = localStorage.getItem('lastProcessedCode')
      if (lastProcessedCode === code) {
        console.log('Código já foi processado, ignorando...')
        return
      }
      
      // Marca este código como processado
      localStorage.setItem('lastProcessedCode', code)
      
      // Troca o código por tokens
      exchangeCodeForTokens(code)
    }
  }, []) // Remove dependência para executar apenas uma vez

  const exchangeCodeForTokens = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/bling/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          state: 'default_state'
        })
      })

      const tokens = await response.json()
      setTokenInfo(tokens)
      setConnected(true)
      
      // Remove o código da URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      alert('Erro ao obter tokens: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Teste API Bling NFe</h1>
        <p className="subtitle">Sistema de teste para integração com a API do Bling</p>

        <div className="status-card">
          <h2>Status da Conexão</h2>
          <div className="status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {!connected ? (
            <button 
              className="btn btn-primary" 
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? 'Conectando...' : 'Conectar com Bling'}
            </button>
          ) : (
            <div>
              <div className="token-info">
                <h3>Token Info:</h3>
                <p><strong>Access Token:</strong> {tokenInfo?.access_token?.substring(0, 20)}...</p>
                <p><strong>Refresh Token:</strong> {tokenInfo?.refresh_token?.substring(0, 20)}...</p>
                <p><strong>Escopo:</strong> {tokenInfo?.expires_in}</p>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn btn-success" 
                  onClick={handleTestAPI}
                  disabled={loading}
                >
                  {loading ? 'Testando...' : 'Testar API NFe'}
                </button>
                <button 
                  className="btn btn-purple" 
                  onClick={() => setShowNFeModal(true)}
                  disabled={loading}
                >
                  Criar NFe
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleDisconnect}
                >
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>

        {testResult && (
          <div className="result-card">
            <h2>Resultado do Teste</h2>
            <div className="result-status">
              {testResult.error ? (
                <span className="error">❌ Erro</span>
              ) : (
                <span className="success">✅ Sucesso</span>
              )}
            </div>
            <pre className="result-content">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <footer>
          <p>Sistema de teste para API Bling - Desenvolvido com Vite</p>
        </footer>

        {/* Modal de Criação de NFe */}
        <NFeModal
          isOpen={showNFeModal}
          onClose={() => setShowNFeModal(false)}
          onSubmit={handleCreateNFe}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default App

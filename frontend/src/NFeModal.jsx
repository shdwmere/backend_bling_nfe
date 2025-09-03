import { useState } from 'react'
import './NFeModal.css'

const NFeModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [activeTab, setActiveTab] = useState('cliente')
  const [formData, setFormData] = useState({
    // Dados do Cliente
    tipoPessoa: 'J',
    contribuinte: '1',
    razaoSocial: '',
    nomeFantasia: '',
    numeroDocumento: '',
    inscricaoEstadual: '',
    
    // Dados do Endereço
    cep: '',
    uf: '',
    cidade: '',
    bairro: '',
    endereco: '',
    numero: '',
    complemento: '',
    
    // Dados do Contato
    telefone: '',
    celular: '',
    email: '',
    
    // Dados dos Produtos (agora é array)
    produtos: [
      {
        id: 1,
        nomeProduto: '',
        valor: '',
        quantidade: 1,
        unidade: 'UN'
      }
    ]
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProductChange = (productId, field, value) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map(produto => 
        produto.id === productId 
          ? { ...produto, [field]: value }
          : produto
      )
    }))
  }

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      nomeProduto: '',
      valor: '',
      quantidade: 1,
      unidade: 'UN'
    }
    setFormData(prev => ({
      ...prev,
      produtos: [...prev.produtos, newProduct]
    }))
  }

  const removeProduct = (productId) => {
    if (formData.produtos.length > 1) {
      setFormData(prev => ({
        ...prev,
        produtos: prev.produtos.filter(produto => produto.id !== productId)
      }))
    }
  }

  const handleSubmit = () => {
    // Validação básica dos dados gerais
    const requiredFields = ['razaoSocial', 'numeroDocumento', 'cep', 'uf', 'cidade', 'bairro', 'endereco']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      alert(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      return
    }

    // Validação dos produtos
    const invalidProducts = formData.produtos.filter(produto => 
      !produto.nomeProduto || !produto.valor || produto.valor <= 0
    )
    
    if (invalidProducts.length > 0) {
      alert('Todos os produtos devem ter nome e valor válido!')
      return
    }

    // Converte dados para o formato da API (mantém compatibilidade)
    const nfeData = {
      nome: formData.razaoSocial,
      numeroDocumento: formData.numeroDocumento,
      tipoPessoa: formData.tipoPessoa,
      contribuinte: parseInt(formData.contribuinte),
      inscricaoEstadual: formData.inscricaoEstadual,
      telefone: formData.telefone,
      email: formData.email,
      endereco: formData.endereco,
      bairro: formData.bairro,
      cidade: formData.cidade,
      numero: formData.numero,
      complemento: formData.complemento,
      cep: formData.cep,
      uf: formData.uf,
      // Para compatibilidade, usa o primeiro produto
      nomeProduto: formData.produtos[0].nomeProduto,
      valor: parseFloat(formData.produtos[0].valor),
      // Adiciona todos os produtos
      produtos: formData.produtos.map(produto => ({
        nome: produto.nomeProduto,
        valor: parseFloat(produto.valor),
        quantidade: parseInt(produto.quantidade) || 1,
        unidade: produto.unidade || 'UN'
      }))
    }

    onSubmit(nfeData)
  }

  const tabs = [
    { id: 'cliente', icon: '👤', label: 'Cliente' },
    { id: 'endereco', icon: '🏠', label: 'Endereço' },
    { id: 'contato', icon: '📞', label: 'Contato' },
    { id: 'produto', icon: '📦', label: 'Produto' }
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Criar NFe com Dados Completos</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* Aba Cliente */}
          {activeTab === 'cliente' && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Pessoa *</label>
                  <select
                    value={formData.tipoPessoa}
                    onChange={(e) => handleInputChange('tipoPessoa', e.target.value)}
                  >
                    <option value="J">Jurídica</option>
                    <option value="F">Física</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contribuinte *</label>
                  <select
                    value={formData.contribuinte}
                    onChange={(e) => handleInputChange('contribuinte', e.target.value)}
                  >
                    <option value="1">1 - Contribuinte ICMS</option>
                    <option value="2">2 - Contribuinte isento de Inscrição no cadastro de Contribuintes do ICMS</option>
                    <option value="9">9 - Não Contribuinte</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Razão Social *</label>
                <input
                  type="text"
                  placeholder="ACTUM INDUSTRIA E COMERCIO LTDA"
                  value={formData.razaoSocial}
                  onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Nome Fantasia</label>
                <input
                  type="text"
                  placeholder="ACTUM INDUSTRIA E COMERCIO LTDA"
                  value={formData.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CNPJ *</label>
                  <input
                    type="text"
                    placeholder="07.429.818/0030-08"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Inscrição Estadual</label>
                  <input
                    type="text"
                    placeholder="87171914"
                    value={formData.inscricaoEstadual}
                    onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Endereço */}
          {activeTab === 'endereco' && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>CEP *</label>
                  <input
                    type="text"
                    placeholder="20940-010"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>UF *</label>
                  <input
                    type="text"
                    placeholder="RJ"
                    value={formData.uf}
                    onChange={(e) => handleInputChange('uf', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Cidade *</label>
                  <input
                    type="text"
                    placeholder="Rio de Janeiro"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bairro *</label>
                <input
                  type="text"
                  placeholder="São Cristóvão"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Endereço *</label>
                  <input
                    type="text"
                    placeholder="Rua Antunes Maciel"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input
                    type="text"
                    placeholder="131"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input
                    type="text"
                    placeholder="Sala 1"
                    value={formData.complemento}
                    onChange={(e) => handleInputChange('complemento', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba Contato */}
          {activeTab === 'contato' && (
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="text"
                    placeholder="(21) 3234-5678"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Celular</label>
                  <input
                    type="text"
                    placeholder="(21) 99999-9999"
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Aba Produto */}
          {activeTab === 'produto' && (
            <div className="form-section">
              <div className="products-header">
                <h3>Produtos da NFe</h3>
                <button 
                  type="button" 
                  className="btn-add-product"
                  onClick={addProduct}
                >
                  + Adicionar Produto
                </button>
              </div>

              {formData.produtos.map((produto, index) => (
                <div key={produto.id} className="product-item">
                  <div className="product-header">
                    <span className="product-number">Produto {index + 1}</span>
                    {formData.produtos.length > 1 && (
                      <button 
                        type="button" 
                        className="btn-remove-product"
                        onClick={() => removeProduct(produto.id)}
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-2">
                      <label>Nome do Produto *</label>
                      <input
                        type="text"
                        placeholder="Ex: Produto de exemplo"
                        value={produto.nomeProduto}
                        onChange={(e) => handleProductChange(produto.id, 'nomeProduto', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantidade *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={produto.quantidade}
                        onChange={(e) => handleProductChange(produto.id, 'quantidade', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Unidade</label>
                      <select
                        value={produto.unidade}
                        onChange={(e) => handleProductChange(produto.id, 'unidade', e.target.value)}
                      >
                        <option value="UN">UN - Unidade</option>
                        <option value="KG">KG - Quilograma</option>
                        <option value="L">L - Litro</option>
                        <option value="M">M - Metro</option>
                        <option value="M2">M² - Metro Quadrado</option>
                        <option value="M3">M³ - Metro Cúbico</option>
                        <option value="PC">PC - Peça</option>
                        <option value="PAR">PAR - Par</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Valor Unitário (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={produto.valor}
                        onChange={(e) => handleProductChange(produto.id, 'valor', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total (R$)</label>
                      <input
                        type="text"
                        value={(parseFloat(produto.valor || 0) * parseInt(produto.quantidade || 1)).toFixed(2)}
                        disabled
                        className="readonly-input"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="products-total">
                <strong>
                  Total Geral: R$ {
                    formData.produtos.reduce((total, produto) => 
                      total + (parseFloat(produto.valor || 0) * parseInt(produto.quantidade || 1)), 0
                    ).toFixed(2)
                  }
                </strong>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-create" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Criando NFe...' : 'Criar NFe'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NFeModal
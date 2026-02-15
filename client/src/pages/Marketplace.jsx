import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const categories = ['All', 'Development', 'Data', 'Creative', 'Security', 'Productivity', 'Communication']

function AgentCard({ agent, onDeploy, deployedIds }) {
  const isDeployed = deployedIds.includes(agent.id)
  
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < fullStars ? '#fbbf24' : '#4a4a5e' }}>★</span>
      )
    }
    return stars
  }
  
  return (
    <motion.div 
      className="agent-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="agent-card-header">
        <div className="agent-icon">{agent.icon}</div>
        <div className="agent-info">
          <h3 className="agent-name">{agent.name}</h3>
          <p className="agent-vendor">{agent.vendor}</p>
        </div>
      </div>
      
      <span className="agent-category">{agent.category}</span>
      
      <p className="agent-description">{agent.description}</p>
      
      <div className="agent-meta">
        <div className="agent-rating">
          <span className="agent-rating-stars">{renderStars(agent.rating)}</span>
          <span className="agent-rating-value">{agent.rating}</span>
          <span className="agent-reviews">({agent.reviews})</span>
        </div>
        <div className="agent-price" style={{ color: agent.price === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
          {agent.price === 0 ? 'Free' : `$${agent.price}/mo`}
        </div>
      </div>
      
      <div className="agent-card-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onDeploy(agent)}
          disabled={isDeployed}
          style={{ opacity: isDeployed ? 0.5 : 1 }}
        >
          {isDeployed ? '✓ Deployed' : 'Deploy'}
        </button>
        <button className="btn btn-secondary">Details</button>
      </div>
    </motion.div>
  )
}

export default function Marketplace({ searchQuery, showToast }) {
  const [agents, setAgents] = useState([])
  const [category, setCategory] = useState('All')
  const [deployedIds, setDeployedIds] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchAgents()
    fetchDeployed()
  }, [])
  
  useEffect(() => {
    fetchAgents()
  }, [category, searchQuery])
  
  const fetchAgents = async () => {
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.append('category', category)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/agents?${params}`)
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchDeployed = async () => {
    try {
      const response = await fetch('/api/deployed')
      const data = await response.json()
      setDeployedIds(data.map(d => d.agentId))
    } catch (error) {
      console.error('Failed to fetch deployed:', error)
    }
  }
  
  const handleDeploy = async (agent) => {
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id })
      })
      
      if (response.ok) {
        setDeployedIds([...deployedIds, agent.id])
        showToast(`${agent.name} deployed successfully!`, 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Failed to deploy', 'error')
      }
    } catch (error) {
      showToast('Failed to deploy agent', 'error')
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container">
        <section className="hero">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Discover & Deploy AI Agents
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Find the perfect AI agent for your needs. One-click deployment with built-in orchestration.
          </motion.p>
        </section>
        
        <motion.div 
          className="category-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </motion.div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p>Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No agents found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="agent-grid">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AgentCard 
                  agent={agent} 
                  onDeploy={handleDeploy}
                  deployedIds={deployedIds}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

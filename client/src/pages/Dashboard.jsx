import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Dashboard({ showToast }) {
  const [stats, setStats] = useState({ totalDeployed: 0, activeWorkflows: 0, totalApiCalls: 0, uptime: 100 })
  const [deployed, setDeployed] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [statsRes, deployedRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/deployed')
      ])
      
      const statsData = await statsRes.json()
      const deployedData = await deployedRes.json()
      
      setStats(statsData)
      setDeployed(deployedData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running'
    
    try {
      const response = await fetch(`/api/deployed/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setDeployed(deployed.map(d => d.id === id ? updated : d))
        showToast(`Agent ${newStatus === 'running' ? 'started' : 'stopped'}`, 'success')
      }
    } catch (error) {
      showToast('Failed to update status', 'error')
    }
  }
  
  const handleRemove = async (id, name) => {
    try {
      const response = await fetch(`/api/deployed/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setDeployed(deployed.filter(d => d.id !== id))
        showToast(`${name} removed`, 'success')
        fetchData()
      }
    } catch (error) {
      showToast('Failed to remove agent', 'error')
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
        <h1 style={{ marginBottom: '48px' }}>Dashboard</h1>
        
        <div className="dashboard-stats">
          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-label">Agents Deployed</div>
            <div className="stat-value">{stats.totalDeployed}</div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-label">Active Workflows</div>
            <div className="stat-value">{stats.activeWorkflows}</div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-label">API Calls (Month)</div>
            <div className="stat-value">{stats.totalApiCalls.toLocaleString()}</div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-label">Average Uptime</div>
            <div className="stat-value">{stats.uptime}%</div>
          </motion.div>
        </div>
        
        <section className="deployed-section">
          <h2>Deployed Agents</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p>Loading...</p>
            </div>
          ) : deployed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚀</div>
              <h3>No agents deployed yet</h3>
              <p>Start by exploring our marketplace and deploying your first AI agent.</p>
              <Link to="/" className="btn btn-primary">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="deployed-list">
              {deployed.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="deployed-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="deployed-card-icon">{item.agent.icon}</div>
                  <div className="deployed-card-info">
                    <div className="deployed-card-name">{item.agent.name}</div>
                    <div className="deployed-card-status">
                      <span className={`status-dot ${item.status}`}></span>
                      <span style={{ color: item.status === 'running' ? 'var(--success)' : 'var(--error)' }}>
                        {item.status}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        • Deployed {new Date(item.deployedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="deployed-card-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      style={{ minWidth: '80px' }}
                    >
                      {item.status === 'running' ? 'Stop' : 'Start'}
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleRemove(item.id, item.agent.name)}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}

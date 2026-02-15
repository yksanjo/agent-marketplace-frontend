import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Orchestration({ showToast }) {
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [deployed, setDeployed] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [workflowsRes, deployedRes] = await Promise.all([
        fetch('/api/workflows'),
        fetch('/api/deployed')
      ])
      
      const workflowsData = await workflowsRes.json()
      const deployedData = await deployedRes.json()
      
      setWorkflows(workflowsData)
      setDeployed(deployedData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `Workflow ${workflows.length + 1}`,
          nodes: [],
          edges: []
        })
      })
      
      if (response.ok) {
        const newWorkflow = await response.json()
        setWorkflows([...workflows, newWorkflow])
        setSelectedWorkflow(newWorkflow)
        showToast('Workflow created', 'success')
      }
    } catch (error) {
      showToast('Failed to create workflow', 'error')
    }
  }
  
  const handleAddAgentToWorkflow = async (agentId) => {
    if (!selectedWorkflow) return
    
    const agent = deployed.find(d => d.agentId === agentId)?.agent
    if (!agent) return
    
    const newNode = {
      id: `node-${Date.now()}`,
      agentId,
      name: agent.name,
      icon: agent.icon
    }
    
    const updatedNodes = [...selectedWorkflow.nodes, newNode]
    
    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updatedNodes })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setSelectedWorkflow(updated)
        setWorkflows(workflows.map(w => w.id === updated.id ? updated : w))
        showToast('Agent added to workflow', 'success')
      }
    } catch (error) {
      showToast('Failed to add agent', 'error')
    }
  }
  
  const handleRemoveNode = async (nodeId) => {
    if (!selectedWorkflow) return
    
    const updatedNodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId)
    
    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updatedNodes })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setSelectedWorkflow(updated)
        setWorkflows(workflows.map(w => w.id === updated.id ? updated : w))
      }
    } catch (error) {
      showToast('Failed to remove node', 'error')
    }
  }
  
  const handleToggleWorkflow = async (id, currentStatus) => {
    const newStatus = currentStatus === 'running' ? 'inactive' : 'running'
    
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setWorkflows(workflows.map(w => w.id === id ? updated : w))
        if (selectedWorkflow?.id === id) {
          setSelectedWorkflow(updated)
        }
        showToast(`Workflow ${newStatus === 'running' ? 'started' : 'stopped'}`, 'success')
      }
    } catch (error) {
      showToast('Failed to update workflow', 'error')
    }
  }
  
  const handleDeleteWorkflow = async (id) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWorkflows(workflows.filter(w => w.id !== id))
        if (selectedWorkflow?.id === id) {
          setSelectedWorkflow(null)
        }
        showToast('Workflow deleted', 'success')
      }
    } catch (error) {
      showToast('Failed to delete workflow', 'error')
    }
  }
  
  const handleUpdateName = async (id, newName) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setWorkflows(workflows.map(w => w.id === id ? updated : w))
        if (selectedWorkflow?.id === id) {
          setSelectedWorkflow(updated)
        }
      }
    } catch (error) {
      console.error('Failed to update name:', error)
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
        <h1 style={{ marginBottom: '48px' }}>Orchestration</h1>
        
        <div className="orchestration-container">
          <aside className="orchestration-sidebar">
            <h3>Workflows</h3>
            
            <button 
              className="btn btn-primary" 
              onClick={handleCreateWorkflow}
              style={{ width: '100%', marginBottom: '24px' }}
            >
              + New Workflow
            </button>
            
            <div className="workflow-list">
              {workflows.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                  No workflows yet. Create one to get started!
                </p>
              ) : (
                workflows.map((workflow) => (
                  <div 
                    key={workflow.id}
                    className={`workflow-item ${selectedWorkflow?.id === workflow.id ? 'active' : ''}`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="workflow-item-name">{workflow.name}</div>
                    <div className="workflow-item-status">
                      <span style={{ 
                        color: workflow.status === 'running' ? 'var(--success)' : 'var(--text-secondary)' 
                      }}>
                        {workflow.status}
                      </span>
                      <span> • {workflow.nodes.length} nodes</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
          
          <main className="orchestration-canvas">
            {!selectedWorkflow ? (
              <div className="orchestration-canvas-empty">
                <div className="orchestration-canvas-empty-icon">🔗</div>
                <h3>Select or create a workflow</h3>
                <p>Build powerful automations by connecting multiple AI agents</p>
              </div>
            ) : (
              <div className="workflow-builder">
                <div className="workflow-builder-header">
                  <div className="workflow-builder-title">
                    <input 
                      type="text" 
                      value={selectedWorkflow.name}
                      onChange={(e) => handleUpdateName(selectedWorkflow.id, e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleToggleWorkflow(selectedWorkflow.id, selectedWorkflow.status)}
                    >
                      {selectedWorkflow.status === 'running' ? '⏹ Stop' : '▶ Run'}
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    Available Agents (drag or click to add)
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    {deployed.filter(d => d.status === 'running').map((item) => {
                      const isInWorkflow = selectedWorkflow.nodes.some(n => n.agentId === item.agentId)
                      return (
                        <button
                          key={item.agentId}
                          className="workflow-node"
                          onClick={() => !isInWorkflow && handleAddAgentToWorkflow(item.agentId)}
                          style={{ 
                            opacity: isInWorkflow ? 0.5 : 1,
                            cursor: isInWorkflow ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <span className="workflow-node-icon">{item.agent.icon}</span>
                          <span className="workflow-node-name">{item.agent.name}</span>
                        </button>
                      )
                    })}
                    {deployed.filter(d => d.status === 'running').length === 0 && (
                      <p style={{ color: 'var(--text-secondary)' }}>
                        No running agents. Deploy agents from the marketplace first.
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    Workflow Nodes
                  </h4>
                  <div className="workflow-nodes">
                    {selectedWorkflow.nodes.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', width: '100%', textAlign: 'center' }}>
                        Click an agent above to add it to this workflow
                      </p>
                    ) : (
                      selectedWorkflow.nodes.map((node, index) => (
                        <motion.div
                          key={node.id}
                          className="workflow-node"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{ position: 'relative' }}
                        >
                          <span className="workflow-node-icon">{node.icon}</span>
                          <span className="workflow-node-name">{node.name}</span>
                          <button
                            onClick={() => handleRemoveNode(node.id)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'var(--error)',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                          {index < selectedWorkflow.nodes.length - 1 && (
                            <span style={{ 
                              position: 'absolute', 
                              right: '-24px', 
                              top: '50%', 
                              transform: 'translateY(-50%)',
                              color: 'var(--accent-primary)'
                            }}>
                              →
                            </span>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  )
}

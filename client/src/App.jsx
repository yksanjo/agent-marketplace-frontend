import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Marketplace from './pages/Marketplace'
import Dashboard from './pages/Dashboard'
import Orchestration from './pages/Orchestration'

function Header({ searchQuery, setSearchQuery }) {
  const location = useLocation()
  
  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <div className="header-logo-icon">🧠</div>
        <span>AgentHub</span>
      </Link>
      
      <nav className="header-nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Marketplace
        </Link>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/orchestration" className={location.pathname === '/orchestration' ? 'active' : ''}>
          Orchestration
        </Link>
      </nav>
      
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#">Documentation</a>
          <a href="#">API</a>
          <a href="#">Support</a>
          <a href="#">GitHub</a>
        </div>
        <div className="footer-copyright">
          © 2026 AgentHub. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  return (
    <motion.div 
      className={`toast ${type}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
    </motion.div>
  )
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }
  
  return (
    <BrowserRouter>
      <div className="app">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="main">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Marketplace searchQuery={searchQuery} showToast={showToast} />} />
              <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
              <Route path="/orchestration" element={<Orchestration showToast={showToast} />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <Footer />
        
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  )
}

export default App

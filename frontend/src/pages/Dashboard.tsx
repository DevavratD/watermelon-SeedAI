import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ShieldAlert, Activity, Search, Filter,
  CheckCircle, XOctagon, AlertTriangle, ChevronRight,
  Play, TrendingUp, Shield, Users
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import TransactionDetails from '../components/dashboard/TransactionDetails'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'
const DEMO_USER = 'demo_rahul'

const PERSONAS = {
  baseline: {
    id: 'demo_rahul',
    name: 'Amount Escalation (Baseline)',
    scenarios: [
      { amount: 350, location: 'New Delhi', merchant_type: 'grocery', label: 'Normal Grocery (₹350)' },
      { amount: 3000, location: 'New Delhi', merchant_type: 'electronics', label: 'New Phone (₹3k - Verify)' },
      { amount: 15000, location: 'New Delhi', merchant_type: 'jewelry', label: 'Jewelry (₹15k - Block)' },
    ]
  },
  velocity: {
    id: 'demo_sarah',
    name: 'Velocity Attack (Carding)',
    scenarios: [
      { amount: 101, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 1' },
      { amount: 102, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 2' },
      { amount: 103, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 3' },
      { amount: 104, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 4' },
      { amount: 105, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 5 (Verify)' },
      { amount: 106, location: 'Bangalore', merchant_type: 'digital', label: 'Micro-Txn 6 (Block)' },
    ]
  },
  location: {
    id: 'demo_amit',
    name: 'Location Hopping Attack',
    scenarios: [
      { amount: 2000, location: 'Mumbai', merchant_type: 'dining', label: 'Dinner in Mumbai' },
      { amount: 2001, location: 'Zurich', merchant_type: 'atm',    label: 'ATM in Zurich (Instant)' },
    ]
  },
  takeover: {
    id: 'demo_neha',
    name: 'Account Takeover (Time/Amt)',
    scenarios: [
      { amount: 150, location: 'Pune', merchant_type: 'coffee', label: 'Coffee in Pune (Day)' },
      { amount: 40000, location: 'Pune', merchant_type: 'crypto', label: 'High Txn at 3 AM (Block)' },
    ]
  }
}

interface TxItem {
  transaction_id: string
  user_id: string
  amount: number
  location: string
  decision: string
  risk_score: number
  reasons: string[]
  created_at: string
}

const decisionStyle = {
  ALLOW:  { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: <CheckCircle size={14} /> },
  VERIFY: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: <AlertTriangle size={14} /> },
  BLOCK:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: <XOctagon size={14} /> },
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alerts')
  const [txns, setTxns] = useState<TxItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null)
  
  // Multi-persona demo state
  const [activePersona, setActivePersona] = useState<string | null>(null)
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoStep, setDemoStep] = useState(-1)

  const fetchTxns = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/transactions?limit=50`)
      setTxns(data)
    } catch { /* backend may not be running */ }
  }, [])

  // Poll frequently for LIVE feel
  useEffect(() => {
    fetchTxns()
    const id = setInterval(fetchTxns, 800)
    return () => clearInterval(id)
  }, [fetchTxns])

  // KPI metrics
  const totalToday = txns.length
  const blocked = txns.filter(t => t.decision === 'BLOCK').length
  const verified = txns.filter(t => t.decision === 'VERIFY').length
  const avgRisk = txns.length ? (txns.reduce((a, t) => a + t.risk_score, 0) / txns.length).toFixed(1) : '—'

  // Telemetry chart data — last 20 transactions mapped to risk timeline
  const chartData = txns.slice(0, 20).reverse().map((t, i) => ({
    name: `#${i + 1}`,
    risk: t.risk_score,
    decision: t.decision,
  }))

  // Filtered txns for table
  const filtered = txns.filter(t =>
    !search || t.transaction_id.includes(search) || t.user_id.includes(search) || t.location.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const alertOnlyFiltered = activeTab === 'cases'
    ? filtered.filter(t => t.decision !== 'ALLOW')
    : filtered

  // Live Demo runner for specific persona
  const runDemo = async (personaKey: string) => {
    if (demoRunning) return
    setActivePersona(personaKey)
    setDemoRunning(true)
    
    const personaData = PERSONAS[personaKey as keyof typeof PERSONAS]
    
    // Vary delays to look authentic but keep demo moving
    const fastDelay = 1200;
    const normalDelay = 2500;
    
    for (let i = 0; i < personaData.scenarios.length; i++) {
      setDemoStep(i)
      const isBurst = personaKey === 'velocity';
      try {
        await axios.post(`${BACKEND_URL}/analyze-transaction`, {
          user_id: personaData.id,
          ...personaData.scenarios[i],
        })
        await fetchTxns()
      } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, isBurst ? fastDelay : normalDelay))
    }
    
    setDemoStep(-1)
    setDemoRunning(false)
    setTimeout(() => setActivePersona(null), 3000)
  }

  const sidebarItems = [
    { id: 'alerts',    label: 'Alert Queue', icon: <Bell size={18} /> },
    { id: 'analytics', label: 'Telemetry',   icon: <Activity size={18} /> },
    { id: 'cases',     label: 'Active Cases', icon: <ShieldAlert size={18} /> },
  ]

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#F5F5F5' }}>
      <div style={{ display: 'flex', paddingTop: '72px' }}>

        {/* Sidebar */}
        <aside style={{ width: '240px', borderRight: '1px solid #1a1a1a', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, minHeight: 'calc(100vh - 72px)' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 8px' }}>Analyst Workspace</p>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px',
              borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              background: activeTab === item.id ? 'rgba(167,139,250,0.1)' : 'transparent',
              color: activeTab === item.id ? '#A78BFA' : '#666',
              fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500,
              transition: 'all 0.15s',
            }}>
              {item.icon} {item.label}
            </button>
          ))}

          {/* New Multi-Persona Section */}
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px 8px' }}>Simulate Attacks</p>
            
            {Object.entries(PERSONAS).map(([key, persona]) => {
              const isActive = activePersona === key;
              const isDisabled = demoRunning && !isActive;
              
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <motion.button
                    whileHover={!isDisabled ? { scale: 1.02, backgroundColor: '#222' } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    onClick={() => runDemo(key)}
                    disabled={demoRunning}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #222',
                      background: isActive ? 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.15))' : '#0a0a0a',
                      color: isDisabled ? '#444' : isActive ? '#A78BFA' : '#AAA',
                      fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '12px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px',
                      textAlign: 'left', transition: 'all 0.2s',
                    }}
                  >
                    <Play size={12} color={isActive ? '#A78BFA' : '#555'} />
                    {isActive && demoRunning ? `Running ${demoStep + 1}/${persona.scenarios.length}` : persona.name}
                  </motion.button>
                  
                  {/* Step indicators only shown when active */}
                  {isActive && demoRunning && (
                    <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                      {persona.scenarios.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                            background: i < demoStep ? '#10B981' : i === demoStep ? '#A78BFA' : '#2a2a2a',
                          }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: i === demoStep ? '#A78BFA' : '#555' }}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Total Transactions', value: totalToday, icon: <Users size={16} />, color: '#A78BFA' },
              { label: 'Fraud Prevented',    value: blocked,    icon: <Shield size={16} />, color: '#EF4444' },
              { label: 'Step-Up Auth',       value: verified,   icon: <AlertTriangle size={16} />, color: '#F59E0B' },
              { label: 'Avg Risk Score',     value: avgRisk,    icon: <TrendingUp size={16} />, color: '#10B981' },
            ].map(card => (
              <div key={card.label} style={{
                background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666', margin: 0 }}>{card.label}</p>
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'analytics' ? (
            <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: '#F5F5F5', margin: '0 0 24px 0' }}>Risk Score Telemetry</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#333" tick={{ fill: '#555', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#333" tick={{ fill: '#555', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', fontFamily: "'Inter', sans-serif" }}
                      labelStyle={{ color: '#A78BFA' }}
                      itemStyle={{ color: '#F5F5F5' }}
                    />
                    <Area type="monotone" dataKey="risk" stroke="#A78BFA" fill="url(#riskGrad)" strokeWidth={2} dot={{ fill: '#A78BFA', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: "'Inter', sans-serif" }}>
                  No transaction data yet. Run "Start Live Demo" to populate.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Search + filter bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} color="#555" style={{ position: 'absolute', top: '13px', left: '14px' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search transaction ID, user or location..."
                    style={{
                      width: '100%', boxSizing: 'border-box', background: '#0D0D0D', border: '1px solid #1a1a1a',
                      borderRadius: '10px', padding: '11px 14px 11px 36px', color: '#F5F5F5',
                      fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none',
                    }}
                  />
                </div>
                <button style={{
                  background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '10px',
                  padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px',
                  color: '#666', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '13px',
                }}>
                  <Filter size={14} /> Filter
                </button>
              </div>

              {/* Transactions table */}
              <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}>
                      {['Transaction ID', 'User', 'Amount', 'Location', 'Risk Score', 'Decision', 'Time', ''].map(h => (
                        <th key={h} style={{ padding: '14px 20px', color: '#555', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {alertOnlyFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#333' }}>
                            {txns.length === 0
                              ? 'No transactions yet. Click "Start Live Demo" to begin.'
                              : 'No results match your search.'}
                          </td>
                        </tr>
                      ) : alertOnlyFiltered.map((tx, idx) => {
                        const ds = decisionStyle[tx.decision as keyof typeof decisionStyle] || decisionStyle.ALLOW
                        return (
                          <motion.tr
                            key={tx.transaction_id}
                            initial={{ opacity: 0, scale: 0.98, backgroundColor: ds.bg }}
                            animate={{ opacity: 1, scale: 1, backgroundColor: 'transparent' }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ borderBottom: '1px solid #141414', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#111')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '16px 20px', color: '#666', fontFamily: 'monospace', fontSize: '12px' }}>{tx.transaction_id}</td>
                            <td style={{ padding: '16px 20px', color: '#A0A0A0' }}>{tx.user_id}</td>
                            <td style={{ padding: '16px 20px', color: '#F5F5F5', fontWeight: 600 }}>
                              ₹{tx.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '16px 20px', color: '#A0A0A0' }}>{tx.location}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '50%',
                                  background: `${ds.color}18`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 800, fontSize: '12px', color: ds.color,
                                }}>
                                  {tx.risk_score.toFixed(0)}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                                background: ds.bg, color: ds.color, border: `1px solid ${ds.color}44`,
                              }}>
                                {ds.icon} {tx.decision}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', color: '#555', fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {new Date(tx.created_at).toLocaleTimeString()}
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <button
                                onClick={() => setSelectedAlert({ ...tx, id: tx.transaction_id, score: tx.risk_score, status: tx.decision, reason: tx.reasons[0] })}
                                style={{ background: 'transparent', border: 'none', color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                              >
                                Investigate <ChevronRight size={14} />
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      <TransactionDetails alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}

export default Dashboard

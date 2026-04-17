import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, XOctagon, BrainCircuit, Activity, MapPin, Loader2 } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'

interface TransactionDetailsProps {
  alert: any | null
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const panelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 200 } }
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ alert, onClose }) => {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (alert?.id) {
      setLoading(true)
      setError(false)
      setReport(null)

      axios.get(`${BACKEND_URL}/investigate/${alert.id}`)
        .then((res) => {
          setReport(res.data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setError(true)
          setLoading(false)
        })
    }
  }, [alert?.id])

  if (!alert) return null

  return (
    <AnimatePresence>
      <motion.div 
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
      >
        <motion.div 
          onClick={e => e.stopPropagation()}
          variants={panelVariants}
          style={{ width: '600px', background: '#0D0D0D', borderLeft: '1px solid #1a1a1a', height: '100vh', overflowY: 'auto', padding: '40px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>Alert #{alert.id}</h2>
            <button onClick={onClose} style={{ background: '#111', border: '1px solid #2a2a2a', color: '#A0A0A0', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>Risk Score</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: alert.score > 80 ? '#EF4444' : '#F59E0B' }}>{alert.score.toFixed(0)}/100</div>
            </div>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>Transaction Amount</div>
              <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#F5F5F5' }}>₹{alert.amount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* AI Investigation Section */}
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#F5F5F5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={18} color="#A78BFA" /> Local LLM Agentic Investigation
          </h3>
          
          <div style={{ background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '12px', padding: '24px', fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.7', color: '#D4D4D4', marginBottom: '40px', minHeight: '180px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '100%', padding: '40px 0' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 size={32} color="#A78BFA" />
                </motion.div>
                <div style={{ color: '#A78BFA', fontSize: '13px', fontWeight: 500 }}>AI is investigating patterns...</div>
              </div>
            ) : error ? (
              <div style={{ color: '#EF4444' }}>Failed to contact Local LLM. Please make sure Ollama is running and accessible.</div>
            ) : report ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div style={{ marginBottom: '16px' }}><strong>Summary:</strong> {report.summary}</div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Risk Level:</strong> <span style={{ color: report.risk_level?.toLowerCase() === 'high' ? '#EF4444' : report.risk_level?.toLowerCase() === 'medium' ? '#F59E0B' : '#10B981', fontWeight: 600 }}>{report.risk_level}</span>
                </div>
                {report.bullet_points && report.bullet_points.length > 0 && (
                  <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0', color: '#A0A0A0' }}>
                    {report.bullet_points.map((point: string, i: number) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{point}</li>
                    ))}
                  </ul>
                )}
                <div><strong>Recommended Action:</strong> {report.recommended_action}</div>
              </motion.div>
            ) : null}
          </div>

          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#F5F5F5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#A78BFA" /> Automated Engine Logic
          </h3>
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', marginBottom: '40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px', color: '#A0A0A0' }}>Primary Reason</td>
                  <td style={{ padding: '16px', color: '#F5F5F5' }}>{alert.reason || 'Multiple factors detected'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px', color: '#A0A0A0' }}>Action Taken</td>
                  <td style={{ padding: '16px', color: alert.status === 'BLOCK' ? '#EF4444' : alert.status === 'VERIFY' ? '#F59E0B' : '#10B981' }}>{alert.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '14px', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <XOctagon size={18} /> Confirm Fraud
            </button>
            <button style={{ flex: 1, background: '#111', color: '#F5F5F5', padding: '14px', border: '1px solid #2a2a2a', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
              <Check size={18} /> Mark Safe
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionDetails

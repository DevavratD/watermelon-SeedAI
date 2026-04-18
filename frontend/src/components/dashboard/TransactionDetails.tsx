import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, XOctagon, BrainCircuit, Activity, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
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

const riskColor = (score: number) => score >= 75 ? '#EF4444' : score >= 45 ? '#F59E0B' : '#10B981'

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ alert, onClose }) => {
  const [report, setReport]           = useState<any>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(false)
  const [feedback, setFeedback]       = useState<'fraud' | 'safe' | null>(null)
  const [fbLoading, setFbLoading]     = useState(false)

  useEffect(() => {
    if (!alert?.id) return
    setLoading(true)
    setError(false)
    setReport(null)
    setFeedback(null)

    axios.get(`${BACKEND_URL}/investigate/${alert.id}`)
      .then(res  => { setReport(res.data); setLoading(false) })
      .catch(err => { console.error(err);  setError(true);   setLoading(false) })
  }, [alert?.id])

  const submitFeedback = async (isFraud: boolean) => {
    if (!alert?.id || fbLoading) return
    setFbLoading(true)
    try {
      await axios.post(`${BACKEND_URL}/feedback/${alert.id}?is_fraud=${isFraud}`)
      setFeedback(isFraud ? 'fraud' : 'safe')
    } catch (e) {
      console.error('Feedback error', e)
    } finally {
      setFbLoading(false)
    }
  }

  if (!alert) return null

  const rc = riskColor(alert.score)

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden" animate="visible" exit="hidden"
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,5,0.75)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          variants={panelVariants}
          style={{ width: '600px', background: '#0D0D0D', borderLeft: '1px solid #1a1a1a', height: '100vh', overflowY: 'auto', padding: '40px' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 700, color: '#F5F5F5', margin: '0 0 4px 0' }}>
                Alert #{alert.id?.slice(-12)}
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#555', margin: 0 }}>
                {alert.user_id} · {alert.location}
              </p>
            </div>
            <button onClick={onClose} style={{ background: '#111', border: '1px solid #2a2a2a', color: '#A0A0A0', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Score + Amount cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#111', border: `1px solid ${rc}33`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>Risk Score</div>
              <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: rc }}>
                {alert.score.toFixed(0)}<span style={{ fontSize: '16px', color: '#444' }}>/100</span>
              </div>
            </div>
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>Transaction Amount</div>
              <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#F5F5F5' }}>
                ₹{alert.amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* AI Investigation */}
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={16} color="#A78BFA" /> AI Investigation Report
          </h3>

          <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '12px', padding: '24px', fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.8', color: '#D4D4D4', marginBottom: '32px', minHeight: '160px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 0' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Loader2 size={28} color="#A78BFA" />
                </motion.div>
                <div style={{ color: '#A78BFA', fontSize: '13px', fontWeight: 500 }}>Generating investigation report…</div>
              </div>
            ) : error ? (
              <div style={{ color: '#EF4444', fontSize: '13px' }}>
                Could not load investigation report. Check that the backend is running.
              </div>
            ) : report ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                {/* Summary */}
                <p style={{ margin: '0 0 16px 0', color: '#E5E5E5' }}>{report.summary}</p>

                {/* Risk level badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, marginBottom: '16px',
                  background: report.risk_level === 'High' ? 'rgba(239,68,68,0.12)' : report.risk_level === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                  color:      report.risk_level === 'High' ? '#EF4444'              : report.risk_level === 'Medium' ? '#F59E0B'              : '#10B981',
                  border:     `1px solid ${report.risk_level === 'High' ? '#EF444433' : report.risk_level === 'Medium' ? '#F59E0B33' : '#10B98133'}`,
                }}>
                  Risk Level: {report.risk_level}
                </div>

                {/* Bullet points */}
                {report.bullet_points?.length > 0 && (
                  <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0', color: '#A0A0A0', fontSize: '13px' }}>
                    {report.bullet_points.map((pt: string, i: number) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{pt}</li>
                    ))}
                  </ul>
                )}

                {/* Recommended action */}
                <div style={{ background: '#151515', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#A0A0A0', borderLeft: '3px solid #A78BFA' }}>
                  <strong style={{ color: '#F5F5F5' }}>Recommended: </strong>{report.recommended_action}
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Automated Engine Logic */}
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#A78BFA" /> Automated Engine Logic
          </h3>
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '14px 20px', color: '#666', width: '40%' }}>Primary Reason</td>
                  <td style={{ padding: '14px 20px', color: '#F5F5F5' }}>{alert.reason || 'Multiple behavioral factors'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', color: '#666' }}>Action Taken</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: rc }}>{alert.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Analyst Actions */}
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Analyst Decision
          </h3>

          {feedback ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                borderRadius: '12px', padding: '20px', textAlign: 'center',
                background: feedback === 'fraud' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${feedback === 'fraud' ? '#EF444433' : '#10B98133'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                {feedback === 'fraud'
                  ? <ShieldOff size={22} color="#EF4444" />
                  : <ShieldCheck size={22} color="#10B981" />}
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '16px', color: feedback === 'fraud' ? '#EF4444' : '#10B981' }}>
                  {feedback === 'fraud' ? 'Confirmed as Fraud' : 'Marked as Safe'}
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#555', margin: 0 }}>
                Analyst decision recorded. This will be used to improve the model.
              </p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => submitFeedback(true)}
                disabled={fbLoading}
                style={{
                  flex: 1, background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                  padding: '14px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 600, cursor: fbLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', opacity: fbLoading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!fbLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.16)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
              >
                {fbLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <XOctagon size={16} />}
                Confirm Fraud
              </button>
              <button
                onClick={() => submitFeedback(false)}
                disabled={fbLoading}
                style={{
                  flex: 1, background: 'rgba(16,185,129,0.06)', color: '#10B981',
                  padding: '14px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px',
                  fontSize: '14px', fontWeight: 600, cursor: fbLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', opacity: fbLoading ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!fbLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.06)' }}
              >
                {fbLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                Mark Safe
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionDetails

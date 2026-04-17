import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XOctagon, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'
import OTPPanel from './OTPPanel'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'

const REASON_MAP: Record<string, string> = {
  'amount_exceeds_threshold': '66× higher than usual',
  'location_mismatch': 'Unusual location',
  'velocity_spike': 'Abnormal frequency',
  'new_merchant': 'New merchant',
  'unusual_time': 'Unusual time',
  'time_mismatch': 'Unusual time',
}

const formatReason = (r: string) =>
  REASON_MAP[r] || r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

interface DecisionPanelProps {
  result: any
  requestPayload?: any
  onReset: () => void
}

const decisionConfig = {
  ALLOW: {
    color: '#10B981',
    bg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.2)',
    icon: <CheckCircle size={40} color="#10B981" />,
    label: 'ALLOW',
    title: 'Payment Approved',
  },
  VERIFY: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.2)',
    icon: <AlertTriangle size={40} color="#F59E0B" />,
    label: 'VERIFY',
    title: 'Step-Up Auth Required',
  },
  BLOCK: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.2)',
    icon: <XOctagon size={40} color="#EF4444" />,
    label: 'BLOCK',
    title: 'Transaction Blocked',
  },
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({ result, requestPayload, onReset }) => {
  const [otpVerified, setOtpVerified] = useState(false)
  const [llmState, setLlmState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [llmReport, setLlmReport] = useState<any>(null)

  const decision = otpVerified ? 'ALLOW' : result.decision
  const cfg = decisionConfig[decision as keyof typeof decisionConfig] || decisionConfig.ALLOW
  const topReasons = (result.reasons || []).slice(0, 3).map(formatReason)
  const riskScore = result.risk_score || 0
  const riskPct = Math.min(100, Math.max(0, riskScore))

  const handleGenerateReport = async () => {
    setLlmState('loading')
    try {
      const { data } = await axios.get(`${BACKEND_URL}/investigate/${result.transaction_id}`)
      setLlmReport(data)
      setLlmState('done')
    } catch (e) {
      console.error(e)
      setLlmReport({ summary: "Failed to connect to LLM Engine." })
      setLlmState('done')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '4px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F5F5F5' }}>
          Outcome
        </span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#555', margin: '2px 0 0 0' }}>
          Final decision from SeedAI
        </p>
      </div>

      {/* Big Decision Badge */}
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '16px', padding: '28px 20px', textAlign: 'center',
        boxShadow: `0 0 40px ${cfg.color}12`,
      }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          style={{ marginBottom: '12px' }}
        >
          {cfg.icon}
        </motion.div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 800,
          color: cfg.color, letterSpacing: '0.06em', marginBottom: '4px',
        }}>
          {cfg.label}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#A0A0A0' }}>
          {cfg.title}
        </div>
      </div>

      {/* Risk Score Bar */}
      <div style={{
        background: '#0D0D0D', border: '1px solid #1a1a1a',
        borderRadius: '12px', padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', letterSpacing: '0.05em' }}>
            RISK SCORE
          </span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 800, color: cfg.color }}>
            {riskScore.toFixed(0)}<span style={{ fontSize: '12px', color: '#444', fontWeight: 400 }}>/100</span>
          </span>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ height: '100%', borderRadius: '9999px', background: cfg.color }}
          />
        </div>
      </div>

      {/* Top 3 Reasons */}
      {topReasons.length > 0 && (
        <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', letterSpacing: '0.05em', marginBottom: '12px' }}>
            RISK FACTORS
          </div>
          {topReasons.map((reason: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 0',
                borderBottom: i < topReasons.length - 1 ? '1px solid #141414' : 'none',
              }}
            >
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: cfg.color, flexShrink: 0,
              }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#D4D4D4' }}>
                {reason}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* LLM Investigator Action */}
      <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#A78BFA" />
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#A78BFA', letterSpacing: '0.05em' }}>
              LLM COPILOT
            </span>
          </div>
          {llmState === 'idle' && (
            <button
              onClick={handleGenerateReport}
              style={{
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '6px', padding: '4px 10px', color: '#A78BFA',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Generate SAR
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {llmState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}
            >
              <Loader2 size={12} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              Running inference (qwen3:1.7b)...
            </motion.div>
          )}
          {llmState === 'done' && llmReport && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#0A0A0A', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '12px' }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#E5E5E5', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                {llmReport.summary}
              </p>
              {llmReport.recommended_action && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1a1a1a' }}>
                  <span style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', fontWeight: 700 }}>ACTION:</span>
                  <span style={{ color: '#A0A0A0', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>{llmReport.recommended_action}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OTP Panel */}
      <AnimatePresence>
        {decision === 'VERIFY' && !otpVerified && (
          <OTPPanel
            transactionId={result.transaction_id}
            demoOtp={result.otp}
            onSuccess={() => setOtpVerified(true)}
            onExpired={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Transfer Ledger */}
      <div style={{ marginTop: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {decision === 'ALLOW' && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                background: '#0D0D0D', border: '1px solid #10B981',
                borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ color: '#10B981', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600 }}>Ledger Sequence Initiated</span>
                 <CheckCircle size={14} color="#10B981" />
              </div>
              <div style={{ background: '#1a1a1a', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: '#10B981', height: '100%' }}
                />
              </div>
              <span style={{ color: '#A0A0A0', fontFamily: "'Inter', sans-serif", fontSize: '12px', textAlign: 'right' }}>
                ₹{requestPayload?.amount || '0'} sent to {requestPayload?.merchant_name || 'merchant'}
              </span>
            </motion.div>
          )}

          {decision === 'BLOCK' && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                background: '#0D0D0D', border: '1px dashed rgba(239,68,68,0.5)',
                borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ color: '#EF4444', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600 }}>Transfer Halted</span>
                 <XOctagon size={14} color="#EF4444" />
              </div>
               <span style={{ color: '#A0A0A0', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                ₹{requestPayload?.amount || '0'} locked by core engine.
              </span>
            </motion.div>
          )}

           {decision === 'VERIFY' && !otpVerified && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: '#0D0D0D', border: '1px solid rgba(245,158,11,0.5)',
                  borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px'
                }}
              >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600 }}>Funds Suspended</span>
                     <Loader2 size={14} color="#F59E0B" className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                  <span style={{ color: '#A0A0A0', fontFamily: "'Inter', sans-serif", fontSize: '12px' }}>
                    Awaiting user validation to release funds...
                  </span>
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          marginTop: '4px', padding: '12px', background: 'transparent',
          border: '1px solid #2a2a2a', borderRadius: '10px',
          color: '#666', fontFamily: "'Inter', sans-serif",
          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        ← New Payment
      </button>
    </motion.div>
  )
}

export default DecisionPanel

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XOctagon, AlertTriangle, ArrowLeft } from 'lucide-react'
import OTPPanel from './OTPPanel'
import ExplainabilityTable from './ExplainabilityTable'

interface DecisionOutputProps {
  result: any
  onReset: () => void
}

const DecisionOutput: React.FC<DecisionOutputProps> = ({ result, onReset }) => {
  const [otpVerified, setOtpVerified] = useState(false)
  const [transactionId] = useState(result?.transaction_id)

  const decision = otpVerified ? 'ALLOW' : result?.decision

  const config = {
    ALLOW: {
      color: '#10B981',
      bg: 'rgba(16,185,129,0.05)',
      border: 'rgba(16,185,129,0.2)',
      icon: <CheckCircle size={56} color="#10B981" />,
      title: 'Payment Successful',
      subtitle: 'No additional verification required.',
      pulse: '#10B981',
    },
    VERIFY: {
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.05)',
      border: 'rgba(245,158,11,0.2)',
      icon: <AlertTriangle size={56} color="#F59E0B" />,
      title: 'Unusual Activity Detected',
      subtitle: 'Additional verification required for your security.',
      pulse: '#F59E0B',
    },
    BLOCK: {
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.05)',
      border: 'rgba(239,68,68,0.2)',
      icon: <XOctagon size={56} color="#EF4444" />,
      title: 'Transaction Blocked',
      subtitle: 'This transaction has been flagged as high risk.',
      pulse: '#EF4444',
    },
  }

  const cfg = config[decision as keyof typeof config] || config.ALLOW

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '520px', margin: '0 auto' }}
    >
      {/* Decision Card */}
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '20px', padding: '40px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 0 60px ${cfg.color}18`,
      }}>
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '160px', height: '160px', borderRadius: '50%',
            border: `2px solid ${cfg.color}`,
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ marginBottom: '16px' }}
        >
          {cfg.icon}
        </motion.div>

        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: cfg.color, margin: '0 0 8px 0' }}>
          {cfg.title}
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#A0A0A0', margin: '0 0 20px 0' }}>
          {cfg.subtitle}
        </p>

        {/* Score badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: '#111', border: `1px solid ${cfg.color}44`, borderRadius: '9999px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>RISK SCORE</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800, color: cfg.color }}>
            {result.risk_score.toFixed(1)}
          </span>
          <span style={{ fontSize: '12px', color: '#444' }}>/ 100</span>
        </div>
      </div>

      {/* OTP Panel — only for VERIFY before verified */}
      <AnimatePresence>
        {decision === 'VERIFY' && !otpVerified && (
          <OTPPanel
            transactionId={transactionId}
            demoOtp={result.otp}
            onSuccess={() => setOtpVerified(true)}
            onExpired={() => { }}
          />
        )}
      </AnimatePresence>

      {/* Explainability Table */}
      {result.feature_breakdown?.length > 0 && (
        <ExplainabilityTable
          breakdown={result.feature_breakdown}
          decision={decision}
          reasons={result.reasons}
        />
      )}

      {/* Reset */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onReset}
        style={{
          padding: '14px', background: 'transparent', border: '1px solid #2a2a2a',
          borderRadius: '12px', color: '#A0A0A0', fontFamily: "'Inter', sans-serif",
          fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <ArrowLeft size={16} /> New Payment
      </motion.button>
    </motion.div>
  )
}

export default DecisionOutput

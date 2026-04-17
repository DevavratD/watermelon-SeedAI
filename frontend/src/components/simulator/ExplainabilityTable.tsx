import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react'

interface BreakdownRow {
  name: string
  normal: string
  current: string
  impact: number
  status: string
}

interface ExplainabilityTableProps {
  breakdown: BreakdownRow[]
  decision: string
  reasons: string[]
}

const statusConfig = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Critical', icon: <AlertOctagon size={12} /> },
  elevated: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Elevated', icon: <AlertTriangle size={12} /> },
  normal:   { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Normal',   icon: <CheckCircle size={12} /> },
}

const REASON_MAP: Record<string, string> = {
  'amount_exceeds_threshold': '66× higher than usual',
  'location_mismatch': 'Unusual location',
  'velocity_spike': 'Abnormal frequency',
  'new_merchant': 'New merchant',
  'unusual_time': 'Unusual time',
  'time_mismatch': 'Unusual time',
}

const formatReason = (r: string) => REASON_MAP[r] || r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const decisionSentence = (decision: string, reasons: string[]) => {
  if (decision === 'ALLOW') return 'Transaction passed all behavioral checks — no unusual patterns detected.'
  const formattedReasons = reasons.map(formatReason)
  if (decision === 'BLOCK') return `Transaction blocked due to: ${formattedReasons[0] || 'multiple high-severity anomalies'}.`
  const top = formattedReasons.slice(0, 2).join(' and ').toLowerCase()
  return `Step-up authentication triggered due to ${top || 'unusual behavioral patterns'}.`
}

const ExplainabilityTable: React.FC<ExplainabilityTableProps> = ({ breakdown, decision, reasons }) => {
  const maxImpact = Math.max(...breakdown.map(r => r.impact), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '24px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#F5F5F5', margin: 0 }}>
          Risk Explanation
        </h3>
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666', letterSpacing: '0.1em' }}>
          BEHAVIORAL ANALYSIS
        </span>
      </div>

      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 90px 80px', gap: '8px', padding: '8px 0', borderBottom: '1px solid #1a1a1a', marginBottom: '8px' }}>
        {['Factor', 'Normal', 'Current', 'Impact', 'Status'].map(h => (
          <span key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#555', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</span>
        ))}
      </div>

      {/* Data rows */}
      {breakdown.map((row, i) => {
        const sc = statusConfig[row.status as keyof typeof statusConfig] || statusConfig.normal
        const barWidth = (row.impact / maxImpact) * 100

        return (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 90px 80px', gap: '8px',
              padding: '12px 0', borderBottom: '1px solid #141414', alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#D4D4D4', fontWeight: 500 }}>{row.name}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#666' }}>{row.normal}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: sc.color, fontWeight: 500 }}>{row.current}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: sc.color, fontWeight: 700 }}>+{row.impact}</span>
              </div>
              <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '9999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${barWidth}%` }}
                  transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                  style={{ height: '100%', background: sc.color, borderRadius: '9999px' }}
                />
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '6px',
              background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: 600,
              fontFamily: "'Inter', sans-serif", border: `1px solid ${sc.color}33`,
            }}>
              {sc.icon} {sc.label}
            </div>
          </motion.div>
        )
      })}

      {/* Why sentence */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{
          marginTop: '16px', padding: '12px 16px',
          background: '#111', borderRadius: '10px', border: '1px solid #1a1a1a',
        }}
      >
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#A0A0A0', margin: 0, lineHeight: 1.6 }}>
          <span style={{ color: '#A78BFA', fontWeight: 600 }}>Why this decision: </span>
          {decisionSentence(decision, reasons)}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default ExplainabilityTable

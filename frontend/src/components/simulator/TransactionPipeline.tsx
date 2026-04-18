import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

type PipelineStage = 0 | 1 | 2 | 3

interface TransactionPipelineProps {
  stage: PipelineStage
  requestPayload: Record<string, unknown> | null
  apiResult: any | null
}

// Minimal JSON syntax highlighter using spans
const JsonHighlight: React.FC<{ data: unknown }> = ({ data }) => {
  const json = JSON.stringify(data, null, 2)
  const highlighted = json
    .replace(/("[\w_]+")\s*:/g, '<span style="color:#A78BFA">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span style="color:#FCD34D">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span style="color:#10B981">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#60A5FA">$1</span>')

  return (
    <pre
      style={{
        margin: 0, fontFamily: 'monospace', fontSize: '12px',
        lineHeight: 1.6, color: '#A0A0A0', overflowX: 'auto',
        whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

const CollapsibleJson: React.FC<{ label: string; data: unknown }> = ({ label, data }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px',
          padding: '4px 10px', cursor: 'pointer', color: '#555',
          fontFamily: 'monospace', fontSize: '11px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: '8px', padding: '12px',
              background: '#0A0A0A', border: '1px solid #1a1a1a',
              borderRadius: '8px',
            }}>
              <JsonHighlight data={data} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StageBlock: React.FC<{
  index: number
  title: string
  badge: string
  children: React.ReactNode
  delay: number
}> = ({ index, title, badge, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    style={{
      background: '#0D0D0D', border: '1px solid #1a1a1a',
      borderRadius: '14px', padding: '20px', marginBottom: '16px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: '11px', color: '#A78BFA', fontWeight: 700,
      }}>
        {index}
      </div>
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600, color: '#F5F5F5' }}>
        {title}
      </span>
      <span style={{
        marginLeft: 'auto', fontFamily: 'monospace', fontSize: '10px',
        color: '#555', letterSpacing: '0.08em',
      }}>
        {badge}
      </span>
    </div>
    {children}
  </motion.div>
)

const DataRow: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #141414',
  }}>
    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#666' }}>{label}</span>
    <span style={{
      fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600,
      color: highlight || '#D4D4D4',
    }}>
      {value}
    </span>
  </div>
)

const TransactionPipeline: React.FC<TransactionPipelineProps> = ({ stage, requestPayload, apiResult }) => {
  const fb = apiResult?.feature_breakdown || []
  const amtEntry = fb.find((r: any) => r.name === 'Amount')
  const avgAmount = amtEntry?.normal       // e.g. "₹1,200 avg"
  const currentAmount = requestPayload?.amount as number | undefined
  // Deviation: extract ratio from current string like "₹500 — 2.3× your usual"
  const deviationMatch = amtEntry?.current?.match(/([\d.]+)×/)
  const deviation = deviationMatch ? deviationMatch[1] + '×' : '—'
  const locEntry = fb.find((r: any) => r.name === 'Location')
  const isNewLocation = locEntry ? locEntry.status !== 'normal' : false

  const decisionColor: Record<string, string> = {
    ALLOW: '#10B981',
    VERIFY: '#F59E0B',
    BLOCK: '#EF4444',
  }
  const dc = apiResult?.decision ? (decisionColor[apiResult.decision] || '#A0A0A0') : '#A0A0A0'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage > 0 ? '#10B981' : '#333' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, color: '#F5F5F5' }}>
            SeedAI Engine
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#555', margin: 0 }}>
          {stage === 0 ? 'Waiting for transaction...' : 'Analyzing in real time'}
        </p>
      </div>

      {stage === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', color: '#333',
        }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{ width: '100%', height: '64px', background: '#0D0D0D', borderRadius: '14px', border: '1px solid #141414' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#333' }}>awaiting request</span>
        </div>
      )}

      <AnimatePresence>
        {/* Stage 1 — Incoming Request */}
        {stage >= 1 && requestPayload && (
          <StageBlock key="stage-1" index={1} title="Incoming Request" badge="POST /analyze-transaction" delay={0}>
            <DataRow label="User" value={String(requestPayload.user_id || '').replace('demo_', '').replace('_', ' ')} />
            <DataRow label="Amount" value={`₹${Number(requestPayload.amount || 0).toLocaleString('en-IN')}`} />
            <DataRow label="Location" value={String(requestPayload.location || '')} />
            <DataRow label="Merchant" value={String(requestPayload.merchant_type || '')} />
            <CollapsibleJson label="{ } raw payload" data={requestPayload} />
          </StageBlock>
        )}

        {/* Stage 2 — Behavioral Analysis */}
        {stage >= 2 && apiResult && (
          <StageBlock key="stage-2" index={2} title="Behavioral Analysis" badge="feature_breakdown" delay={0}>
            <DataRow label="User Avg" value={avgAmount || '—'} />
            <DataRow label="This Payment" value={`₹${Number(currentAmount || 0).toLocaleString('en-IN')}`} />
            <DataRow
              label="Deviation"
              value={deviation !== '—' ? `${deviation} above normal` : 'Normal range'}
              highlight={deviation !== '—' && parseFloat(deviation) >= 2 ? '#F59E0B' : '#10B981'}
            />
            <DataRow
              label="Location"
              value={isNewLocation ? `${locEntry?.current || 'New — never seen before'}` : String(requestPayload?.location || '—')}
              highlight={isNewLocation ? '#F59E0B' : '#10B981'}
            />
            <CollapsibleJson label="{ } feature_breakdown" data={apiResult.feature_breakdown} />
          </StageBlock>
        )}

        {/* Stage 3 — Risk Computation */}
        {stage >= 3 && apiResult && (
          <StageBlock key="stage-3" index={3} title="Risk Engine" badge="decision" delay={0}>
            <DataRow label="Rule Score" value={`${(apiResult.rule_score * 100).toFixed(0)} / 100`} />
            <DataRow label="ML Score" value={`${(apiResult.anomaly_score * 100).toFixed(0)} / 100`} />
            <div style={{
              marginTop: '12px', padding: '14px', borderRadius: '10px',
              background: `${dc}10`, border: `1px solid ${dc}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#D4D4D4' }}>
                Final Risk: {apiResult.risk_score.toFixed(0)}
              </span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800, color: dc,
                letterSpacing: '0.04em',
              }}>
                → {apiResult.decision}
              </span>
            </div>
          </StageBlock>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionPipeline

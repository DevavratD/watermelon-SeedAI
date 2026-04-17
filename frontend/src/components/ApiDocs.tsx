import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, '')


/* ── Types ── */
interface Field {
  name: string
  type: string
  required?: boolean
  desc: string
}
interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  tag: string
  summary: string
  description: string
  protected: boolean
  request?: Field[]
  response: Field[]
  example?: { req?: object; res: object }
}

/* ── Data ── */
const ENDPOINTS: EndpointDef[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    tag: 'Core',
    summary: 'Health Check',
    description: 'Returns the current systemic integrity status of the Fraud Engine.',
    protected: false,
    response: [
      { name: 'status', type: 'string', desc: '"healthy" or "degraded".' },
      { name: 'version', type: 'string', desc: 'Current engine semantic version.' },
    ],
    example: {
      res: { status: 'healthy', version: '2.4.1-stable' },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/analyze-transaction',
    tag: 'Risk',
    summary: 'Fraud Analysis Engine',
    description:
      'The primary decision endpoint. Measures behavioral variance, transaction velocity, and location anomalies using Isolation Forest ML.',
    protected: true,
    request: [
      { name: 'user_id', type: 'string', required: true, desc: 'Unique identifier for the consumer.' },
      { name: 'amount', type: 'number', required: true, desc: 'Transaction amount in USD.' },
      { name: 'location', type: 'string', required: true, desc: 'Geolocation string (City, Country).' },
      { name: 'merchant_type', type: 'string', required: false, desc: 'Category (e.g. "electronics", "food").' },
    ],
    response: [
      { name: 'decision', type: 'string', desc: 'ALLOW | VERIFY | BLOCK' },
      { name: 'risk_score', type: 'number', desc: 'Probability score (0-100).' },
      { name: 'reasons', type: 'string[]', desc: 'Human-readable factor breakdowns.' },
      { name: 'otp', type: 'string', desc: 'Populated if decision is VERIFY.' },
    ],
    example: {
      req: {
        user_id: "user_df293",
        amount: 4500.00,
        location: "London, UK",
        merchant_type: "electronics"
      },
      res: {
        decision: "VERIFY",
        risk_score: 72.4,
        reasons: ["Velocity spike detected", "Unusual location cluster"],
        otp: "849201"
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/verify-transaction',
    tag: 'Auth',
    summary: 'Adaptive Verification',
    description:
      'Resolves step-up authentication challenges. Validates the 6-digit OTP issued during a high-risk analysis.',
    protected: false,
    request: [
      { name: 'transaction_id', type: 'string', required: true, desc: 'The ID of the pending transaction.' },
      { name: 'otp_code', type: 'string', required: true, desc: 'The 6-digit code provided by the user.' },
    ],
    response: [
      { name: 'status', type: 'string', desc: '"success" or "failed".' },
      { name: 'final_decision', type: 'string', desc: '"ALLOW" on successful verification.' },
    ],
    example: {
      req: { transaction_id: "txn_8f9a2b", otp_code: "849201" },
      res: { status: "success", final_decision: "ALLOW" },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/profile/{user_id}',
    tag: 'Telemetry',
    summary: 'User Behavior Profile',
    description: 'Retrieves the learned behavioral model for a specific user, including average amounts and risk tiers.',
    protected: false,
    response: [
      { name: 'user_id', type: 'string', desc: 'Unique ID.' },
      { name: 'risk_tier', type: 'string', desc: 'low | medium | high' },
      { name: 'avg_amount', type: 'number', desc: 'Historical average transaction value.' },
    ],
    example: {
      res: { user_id: "user_df293", risk_tier: "low", avg_amount: 145.20 },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/transactions',
    tag: 'Audit',
    summary: 'Global Audit Log',
    description: 'Returns the most recent transaction decisions across the system for live telemetry monitoring.',
    protected: false,
    response: [
      { name: 'transactions[]', type: 'object[]', desc: 'Array of recent analysis outcomes.' },
    ],
    example: {
      res: { transactions: [{ id: "txn_1", amount: 10.5, decision: "ALLOW" }] },
    },
  },
]

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' },
  POST: { bg: 'rgba(167,139,250,0.15)', text: '#A78BFA' },
}

const TAG_COLORS: Record<string, string> = {
  Core: '#4ade80',
  Risk: '#EF4444',
  Auth: '#A78BFA',
  Telemetry: '#38bdf8',
  Audit: '#fb923c',
}

const ApiDocs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(1) // default open the Risk endpoint
  const [activeTab, setActiveTab] = useState<Record<number, 'schema' | 'example'>>({})

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i))
  const getTab = (i: number) => activeTab[i] ?? 'schema'
  const setTab = (i: number, tab: 'schema' | 'example') =>
    setActiveTab(prev => ({ ...prev, [i]: tab }))

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
            padding: '4px 10px', borderRadius: '20px', fontFamily: "'Inter', sans-serif",
          }}>
            LIVE · {BACKEND_URL.replace('http://', '').replace('https://', '')}
          </span>
          <a
            href={`${BACKEND_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#A78BFA', fontSize: '12px', fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}
          >
            Open Swagger UI →
          </a>
        </div>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px',
          fontWeight: 700, color: '#F5F5F5', marginBottom: '10px',
        }}>
          API Reference
        </h2>
        <p style={{ color: '#A0A0A0', fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.7' }}>
          SeedAI backend runs on <code style={{ color: '#A78BFA', background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>{BACKEND_URL}</code>.
          All risk endpoints enforce the <strong style={{ color: '#F5F5F5' }}>Adaptive Authentication Protocol</strong> — verify high-risk payloads.
        </p>
      </div>

      {/* Base URL bar */}
      <div style={{
        background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: '10px',
        padding: '12px 20px', marginBottom: '24px', display: 'flex',
        alignItems: 'center', gap: '12px', fontFamily: 'monospace', fontSize: '13px',
      }}>
        <span style={{ color: '#666' }}>BASE URL</span>
        <span style={{ color: '#A78BFA' }}>{BACKEND_URL}/api/v1</span>
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '11px' }}>Content-Type: application/json</span>
      </div>

      {/* Endpoint list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENDPOINTS.map((ep, i) => {
          const mc = METHOD_COLORS[ep.method]
          const isOpen = openIndex === i
          const tab = getTab(i)

          return (
            <div
              key={i}
              style={{
                background: '#0a0a0a',
                border: `1px solid ${isOpen ? '#3a3a3a' : '#1e1e1e'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Row header */}
              <button
                onClick={() => toggle(i)}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '16px 20px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '14px',
                }}
              >
                {/* Method badge */}
                <span style={{
                  background: mc.bg, color: mc.text,
                  fontFamily: 'monospace', fontSize: '11px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '6px', minWidth: '44px', textAlign: 'center',
                }}>
                  {ep.method}
                </span>

                {/* Path */}
                <span style={{
                  fontFamily: 'monospace', fontSize: '14px', color: '#F5F5F5', flex: 1,
                }}>
                  {ep.path}
                </span>

                {/* Tag */}
                <span style={{
                  color: TAG_COLORS[ep.tag] ?? '#A0A0A0',
                  fontSize: '11px', fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, letterSpacing: '0.05em',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 8px', borderRadius: '4px',
                }}>
                  {ep.tag}
                </span>

                {/* Protected badge */}
                {ep.protected && (
                  <span style={{
                    color: '#EF4444', fontSize: '10px',
                    background: 'rgba(239,68,68,0.1)',
                    padding: '2px 8px', borderRadius: '4px',
                    fontFamily: "'Inter', sans-serif", fontWeight: 600,
                  }}>
                    🛡️ RISK ENGINE
                  </span>
                )}

                {/* Summary */}
                <span style={{ color: '#666', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
                  {ep.summary}
                </span>

                {/* Chevron */}
                <span style={{
                  color: '#444', fontSize: '16px',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>
                  ▼
                </span>
              </button>

              {/* Expanded body */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      borderTop: '1px solid #1e1e1e',
                      padding: '20px 24px 24px',
                    }}>
                      {/* Description */}
                      <p style={{
                        color: '#A0A0A0', fontFamily: "'Inter', sans-serif",
                        fontSize: '14px', lineHeight: '1.7', marginBottom: '20px',
                      }}>
                        {ep.description}
                      </p>

                      {/* Tabs */}
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                        {(['schema', 'example'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setTab(i, t)}
                            style={{
                              background: tab === t ? '#1e1e1e' : 'transparent',
                              border: `1px solid ${tab === t ? '#3a3a3a' : 'transparent'}`,
                              color: tab === t ? '#F5F5F5' : '#666',
                              fontFamily: "'Inter', sans-serif", fontSize: '12px',
                              fontWeight: 600, padding: '5px 14px', borderRadius: '6px',
                              cursor: 'pointer', textTransform: 'capitalize',
                            }}
                          >
                            {t === 'schema' ? 'Schema' : 'Example'}
                          </button>
                        ))}
                      </div>

                      {tab === 'schema' && (
                        <div style={{ display: 'grid', gridTemplateColumns: ep.request ? '1fr 1fr' : '1fr', gap: '16px' }}>
                          {/* Request */}
                          {ep.request && (
                            <div>
                              <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>
                                REQUEST BODY
                              </div>
                              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                                {ep.request.map((f, fi) => (
                                  <div key={fi} style={{
                                    padding: '10px 14px',
                                    borderBottom: fi < (ep.request?.length ?? 0) - 1 ? '1px solid #1a1a1a' : 'none',
                                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                                  }}>
                                    <div style={{ flex: 1 }}>
                                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#A78BFA' }}>{f.name}</span>
                                      {f.required && <span style={{ color: '#f87171', marginLeft: '4px', fontSize: '10px' }}>*</span>}
                                      <span style={{ color: '#555', fontSize: '11px', fontFamily: "'Inter', sans-serif", marginLeft: '8px' }}>{f.type}</span>
                                    </div>
                                    <div style={{ color: '#666', fontSize: '12px', fontFamily: "'Inter', sans-serif", textAlign: 'right', maxWidth: '55%' }}>
                                      {f.desc}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Response */}
                          <div>
                            <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>
                              RESPONSE (200 OK)
                            </div>
                            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                              {ep.response.map((f, fi) => (
                                <div key={fi} style={{
                                  padding: '10px 14px',
                                  borderBottom: fi < ep.response.length - 1 ? '1px solid #1a1a1a' : 'none',
                                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#4ade80' }}>{f.name}</span>
                                    <span style={{ color: '#555', fontSize: '11px', fontFamily: "'Inter', sans-serif", marginLeft: '8px' }}>{f.type}</span>
                                  </div>
                                  <div style={{ color: '#666', fontSize: '12px', fontFamily: "'Inter', sans-serif", textAlign: 'right', maxWidth: '55%' }}>
                                    {f.desc}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {tab === 'example' && ep.example && (
                        <div style={{ display: 'grid', gridTemplateColumns: ep.example.req ? '1fr 1fr' : '1fr', gap: '16px' }}>
                          {ep.example.req && (
                            <div>
                              <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
                                REQUEST
                              </div>
                              <pre style={{
                                background: '#111', border: '1px solid #1e1e1e',
                                borderRadius: '8px', padding: '16px', margin: 0,
                                fontFamily: 'monospace', fontSize: '12px',
                                color: '#F5F5F5', overflowX: 'auto', lineHeight: '1.6',
                              }}>
                                {JSON.stringify(ep.example.req, null, 2)}
                              </pre>
                            </div>
                          )}
                          <div>
                            <div style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
                              RESPONSE
                            </div>
                            <pre style={{
                              background: '#111', border: '1px solid #1e1e1e',
                              borderRadius: '8px', padding: '16px', margin: 0,
                              fontFamily: 'monospace', fontSize: '12px',
                              color: '#4ade80', overflowX: 'auto', lineHeight: '1.6',
                            }}>
                              {JSON.stringify(ep.example.res, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Developer Toolkit */}
      <div style={{ marginTop: '64px', borderTop: '1px solid #1e1e1e', paddingTop: '40px' }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px',
          fontWeight: 700, color: '#F5F5F5', marginBottom: '24px',
          textAlign: 'center'
        }}>
          Developer Toolkit
        </h2>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* SDK Guide */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ 
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', 
                borderRadius: '8px', padding: '8px', color: '#4ade80', fontSize: '11px', fontWeight: 700
              }}>
                OFFICIAL SDK
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F5F5F5', fontSize: '20px', margin: 0 }}>
                SeedAI Python/JS SDK
              </h3>
            </div>
            <p style={{ color: '#A0A0A0', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Integrate SeedAI risk scoring directly into your payment applications with a single line of code. Handles authentication, payload signing, and risk-factor parsing out of the box.
            </p>
            
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '10px', color: '#444', fontFamily: 'monospace' }}>BASH</div>
              <div style={{ background: '#000', borderRadius: '8px', padding: '14px 18px', fontFamily: 'monospace', fontSize: '13px', color: '#A78BFA', border: '1px solid #1a1a1a' }}>
                $ npm install @seedai/sdk
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '10px', color: '#444', fontFamily: 'monospace' }}>JAVASCRIPT</div>
              <pre style={{ 
                background: '#000', borderRadius: '8px', padding: '24px 18px 18px', margin: 0,
                fontFamily: 'monospace', fontSize: '12px', color: '#888', border: '1px solid #1a1a1a',
                lineHeight: '1.7', overflowX: 'auto'
              }}>
{`import { SeedAIClient } from '@seedai/sdk';

const client = new SeedAIClient({
  endpoint: 'api.seedai.io',
  key: 'sk_live_...'
});

const result = await client.analyze({
  amount: 2500,
  user_id: 'u_942',
  location: 'Paris, FR'
});

console.log(result.decision); // 'VERIFY'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDocs

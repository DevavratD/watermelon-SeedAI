import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import QRScanner from '../components/simulator/QRScanner'
import AmountEntry from '../components/simulator/AmountEntry'
import TransactionPipeline from '../components/simulator/TransactionPipeline'
import DecisionPanel from '../components/simulator/DecisionPanel'
import UserProfilePanel, { LastDecision } from '../components/simulator/UserProfilePanel'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'

type Screen = 'qr' | 'amount' | 'decision'
type PipelineStage = 0 | 1 | 2 | 3

interface MerchantInfo {
  merchant: string
  location: string
  merchant_id: string
  category: string
}

const SimulatorPage: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('qr')
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null)
  const [apiResult, setApiResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(0)
  const [requestPayload, setRequestPayload] = useState<Record<string, unknown> | null>(null)
  const [selectedUser, setSelectedUser] = useState('demo_rahul')
  const [lastDecision, setLastDecision] = useState<LastDecision | null>(null)

  const handleScan = (data: MerchantInfo) => {
    setMerchant(data)
    setScreen('amount')
  }

  const handlePay = async (amount: number) => {
    if (!merchant) return
    setError('')
    setApiResult(null)
    setPipelineStage(0)

    const payload = {
      user_id: selectedUser,
      amount,
      location: merchant.location,
      merchant_type: merchant.category,
      merchant_name: merchant.merchant
    }
    setRequestPayload(payload)

    // Stage 1 immediately
    setPipelineStage(1)

    try {
      const { data } = await axios.post(`${BACKEND_URL}/analyze-transaction`, payload)

      // Stage 2 after API responds (with slight delay for feel)
      await new Promise(r => setTimeout(r, 450))
      setApiResult(data)
      setPipelineStage(2)

      // Stage 3 after a further delay
      await new Promise(r => setTimeout(r, 750))
      setPipelineStage(3)

      // Right panel appears after stage 3
      await new Promise(r => setTimeout(r, 200))
      setScreen('decision')

      // Track this for contrast strip
      setLastDecision({ userId: selectedUser, amount, decision: data.decision })

    } catch {
      setError('Failed to connect to backend. Is it running?')
      setPipelineStage(0)
      setRequestPayload(null)
    }
  }

  const handleReset = () => {
    setScreen('qr')
    setMerchant(null)
    setApiResult(null)
    setError('')
    setPipelineStage(0)
    setRequestPayload(null)
    // Keep lastDecision so the contrast strip stays visible after reset
  }

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId)
    // Reset flow cleanly on user switch
    setScreen('qr')
    setMerchant(null)
    setApiResult(null)
    setError('')
    setPipelineStage(0)
    setRequestPayload(null)
  }

  return (
    <div style={{
      background: '#050505', minHeight: '100vh', color: '#F5F5F5',
      paddingTop: '72px',
    }}>
      {/* Page header */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '24px 32px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px',
            fontWeight: 800, color: '#F5F5F5', margin: 0,
          }}>
            Live Transaction Demo
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#555', margin: '4px 0 0 0' }}>
            Watch SeedAI analyze every payment in real time →
          </p>
        </div>
        {/* Status pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555' }}>
            engine live
          </span>
        </div>
      </div>

      {/* Error bar */}
      {error && (
        <div style={{
          maxWidth: '1400px', margin: '12px auto 0', padding: '0 32px',
        }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '10px 16px',
            color: '#EF4444', fontSize: '13px', fontFamily: "'Inter', sans-serif",
          }}>
            {error}
          </div>
        </div>
      )}

      {/* 3-panel grid */}
      <div style={{
        maxWidth: '1400px', margin: '24px auto 0',
        padding: '0 32px 48px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '20px',
        alignItems: 'start',
      }}>

        {/* LEFT – User Context */}
        <div style={{
          background: '#080808', border: '1px solid #141414',
          borderRadius: '20px', padding: '20px',
          position: 'sticky', top: '92px',
        }}>
          <UserProfilePanel
            selectedUser={selectedUser}
            onUserChange={handleUserChange}
            lastDecision={lastDecision}
          />

          {/* QR / Amount flow inside left panel */}
          <div style={{ marginTop: '20px' }}>
            <AnimatePresence mode="wait">
              {screen === 'qr' && (
                <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <QRScanner userId={selectedUser} onScan={handleScan} />
                </motion.div>
              )}
              {screen === 'amount' && merchant && (
                <motion.div key="amount" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AmountEntry merchant={merchant} onSubmit={handlePay} />
                </motion.div>
              )}
              {screen === 'decision' && (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#555' }}>
                      Transaction complete
                    </p>
                    <button
                      onClick={handleReset}
                      style={{
                        marginTop: '12px', padding: '10px 20px',
                        background: 'transparent', border: '1px solid #2a2a2a',
                        borderRadius: '10px', color: '#A0A0A0',
                        fontFamily: "'Inter', sans-serif", fontSize: '13px',
                        fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      ← New Payment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER – SeedAI Engine */}
        <div style={{
          background: '#080808', border: '1px solid #141414',
          borderRadius: '20px', padding: '24px', minHeight: '500px',
        }}>
          <TransactionPipeline
            stage={pipelineStage}
            requestPayload={requestPayload}
            apiResult={apiResult}
          />
        </div>

        {/* RIGHT – Decision */}
        <div style={{
          background: '#080808', border: '1px solid #141414',
          borderRadius: '20px', padding: '20px',
          minHeight: '200px',
        }}>
          <AnimatePresence mode="wait">
            {screen !== 'decision' || !apiResult ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '12px', padding: '48px 0',
                  color: '#333', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px' }}>⚡</div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', margin: 0 }}>
                  Decision will appear here
                </p>
              </motion.div>
            ) : (
              <motion.div key="decision">
                <DecisionPanel result={apiResult} requestPayload={requestPayload} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}

export default SimulatorPage

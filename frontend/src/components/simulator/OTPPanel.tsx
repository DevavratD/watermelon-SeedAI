import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, RotateCcw, CheckCircle } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'

interface OTPPanelProps {
  transactionId: string
  demoOtp: string | null
  onSuccess: () => void
  onExpired: () => void
}

const OTPPanel: React.FC<OTPPanelProps> = ({ transactionId, demoOtp, onSuccess, onExpired }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [timeLeft, setTimeLeft] = useState(30)
  const [expired, setExpired] = useState(false)
  const [attempts, setAttempts] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (expired) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setExpired(true)
          onExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [expired])

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
    e.preventDefault()
  }

  const handleVerify = async () => {
    const otp = digits.join('')
    if (otp.length !== 6 || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`${BACKEND_URL}/verify-transaction`, {
        transaction_id: transactionId,
        otp,
      })
      if (data.verified) {
        setSuccess(true)
        setTimeout(onSuccess, 1000)
      } else {
        setAttempts(prev => prev - 1)
        setError(attempts <= 1 ? 'Too many incorrect attempts.' : 'Incorrect OTP. Try again.')
        setDigits(Array(6).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('Verification failed. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setTimeLeft(30)
    setExpired(false)
    setDigits(Array(6).fill(''))
    setError('')
    inputRefs.current[0]?.focus()
  }

  const progressPct = (timeLeft / 30) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '16px', padding: '28px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <KeyRound size={20} color="#F59E0B" />
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, color: '#F59E0B', margin: 0 }}>
          Step-Up Authentication
        </h3>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#A0A0A0', margin: '0 0 20px 0' }}>
        OTP sent to registered mobile ••••••7823
      </p>

      {/* Demo OTP display */}
      {demoOtp && (
        <div style={{
          background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px',
          padding: '10px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>DEMO OTP</span>
          <span style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 800, color: '#F5F5F5', letterSpacing: '0.2em' }}>
            {demoOtp}
          </span>
        </div>
      )}

      {/* 6-box input */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            value={d}
            autoFocus={i === 0}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            maxLength={1}
            disabled={expired || success || attempts <= 0}
            style={{
              width: '44px', height: '52px', textAlign: 'center',
              background: d ? '#1a1a1a' : '#0D0D0D',
              border: `2px solid ${error ? '#EF444488' : d ? '#F59E0B88' : '#2a2a2a'}`,
              borderRadius: '10px', color: '#F5F5F5',
              fontFamily: 'monospace', fontSize: '22px', fontWeight: 700,
              outline: 'none', transition: 'border 0.15s',
            }}
          />
        ))}
      </div>

      {/* Timer bar */}
      {!expired && !success && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666' }}>
              Expires in
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: timeLeft <= 10 ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>
              {timeLeft}s
            </span>
          </div>
          <div style={{ background: '#1a1a1a', borderRadius: '9999px', height: '4px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: '9999px', background: timeLeft <= 10 ? '#EF4444' : '#F59E0B' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: '#EF4444', fontSize: '13px', fontFamily: "'Inter', sans-serif", margin: '0 0 12px 0', textAlign: 'center' }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success */}
      {success && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#10B981', marginBottom: '12px' }}>
          <CheckCircle size={20} /> <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Verified!</span>
        </motion.div>
      )}

      {/* Actions */}
      {!success && (
        <div style={{ display: 'flex', gap: '10px' }}>
          {expired || attempts <= 0 ? (
            <button onClick={handleResend} style={{
              flex: 1, padding: '12px', background: '#111', border: '1px solid #333',
              borderRadius: '10px', color: '#A0A0A0', fontFamily: "'Inter', sans-serif",
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <RotateCcw size={14} /> Resend OTP
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={digits.join('').length !== 6 || loading}
              style={{
                flex: 1, padding: '12px', background: digits.join('').length === 6 ? '#F59E0B' : '#1a1a1a',
                border: 'none', borderRadius: '10px', color: digits.join('').length === 6 ? '#000' : '#555',
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '14px',
                cursor: digits.join('').length === 6 ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              }}
            >
              {loading ? 'Verifying...' : 'Confirm Payment'}
            </motion.button>
          )}
        </div>
      )}

      {!expired && !success && attempts < 3 && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#666', fontFamily: "'Inter', sans-serif", margin: '10px 0 0 0' }}>
          {attempts} attempt{attempts !== 1 ? 's' : ''} remaining
        </p>
      )}
    </motion.div>
  )
}

export default OTPPanel

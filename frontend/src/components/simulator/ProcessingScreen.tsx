import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ProcessingScreenProps {
  onDone: () => void
}

const STEPS = [
  'Analyzing transaction...',
  'Checking behavioral patterns...',
  'Decision ready.',
]

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onDone }) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIdx, setCharIdx] = useState(0)
  const doneCalledRef = useRef(false)

  // Typewriter per step
  useEffect(() => {
    if (stepIndex >= STEPS.length) {
      if (!doneCalledRef.current) {
        doneCalledRef.current = true
        setTimeout(onDone, 600)
      }
      return
    }
    const text = STEPS[stepIndex]
    if (charIdx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(text.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      }, 28)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setStepIndex(s => s + 1)
        setCharIdx(0)
        setDisplayed('')
      }, 500)
      return () => clearTimeout(t)
    }
  }, [stepIndex, charIdx])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '40px', padding: '40px' }}>
      {/* Animated neural pulse */}
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid #A78BFA',
            }}
            animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#A78BFA' }}
          />
        </div>
      </div>

      {/* Steps log */}
      <div style={{ width: '100%', maxWidth: '340px' }}>
        {STEPS.slice(0, stepIndex).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>{s}</span>
          </motion.div>
        ))}

        {stepIndex < STEPS.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#A78BFA', flexShrink: 0 }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#A78BFA' }}>
              {displayed}
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>▊</motion.span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcessingScreen

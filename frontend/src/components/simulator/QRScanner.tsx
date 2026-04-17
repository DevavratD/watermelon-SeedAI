import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MapPin, Zap, ShieldAlert, Loader2 } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1'

interface QRScannerProps {
  userId: string
  onScan: (data: { merchant: string; location: string; merchant_id: string; category: string }) => void
}

const DemoScenarioGrid: React.FC<QRScannerProps> = ({ userId, onScan }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null)
  const [manualLocation, setManualLocation] = useState('Mumbai')

  const handleScenario = async (id: string, payload: any, needsVelocity = false) => {
    setLoadingScenario(id)
    try {
      if (needsVelocity) {
        // Attack 3: Pre-inject 5 rapid transactions into Redis to trigger velocity spike
        await axios.post(`${BACKEND_URL}/simulate-velocity/${userId}`)
      }
      // Small visual delay to feel like a "scan"
      setTimeout(() => {
        onScan(payload)
      }, 600)
    } catch (e) {
      console.error(e)
      setLoadingScenario(null)
    }
  }

  const scenarios = [
    {
      id: 'control',
      title: 'Safe Purchase (Baseline)',
      desc: 'Normal checkout in home location',
      icon: <CheckCircle size={20} color="#10B981" />,
      color: '#10B981',
      payload: { merchant: 'RapidMart', location: 'New Delhi', merchant_id: 'merch_001', category: 'grocery' },
      needsVelocity: false,
    },
    {
      id: 'location',
      title: 'Location Anomaly (Cloning)',
      desc: 'Card used in a mathematically impossible location',
      icon: <MapPin size={20} color="#F59E0B" />,
      color: '#F59E0B',
      payload: { merchant: 'Swiss Luxury Watches', location: 'Zurich, Switzerland', merchant_id: 'merch_zurich', category: 'jewelry' },
      needsVelocity: false,
    },
    {
      id: 'velocity',
      title: 'Velocity Spike (Carding)',
      desc: 'Simulates 5 rapid micro-transactions before this payment',
      icon: <Zap size={20} color="#EF4444" />,
      color: '#EF4444',
      payload: { merchant: 'Steam Games', location: 'New Delhi', merchant_id: 'merch_steam', category: 'digital' },
      needsVelocity: true,
    }
  ]

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldAlert size={18} color="#A78BFA" />
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#A78BFA', margin: 0 }}>
            Attack Scenario Injector
          </h3>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#666', margin: 0 }}>
          Select a vector to simulate physical QR scanning
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {scenarios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => loadingScenario ? null : handleScenario(s.id, s.payload, s.needsVelocity)}
            whileHover={{ scale: loadingScenario ? 1 : 1.02 }}
            whileTap={{ scale: loadingScenario ? 1 : 0.98 }}
            style={{
              background: '#0D0D0D', border: `1px solid ${s.color}44`,
              borderRadius: '14px', padding: '16px', display: 'flex',
              alignItems: 'center', gap: '16px', cursor: loadingScenario ? 'wait' : 'pointer',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {loadingScenario === s.id ? <Loader2 size={20} color={s.color} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> : s.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#E5E5E5' }}>
                {s.title}
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {s.desc}
              </div>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </motion.div>
        ))}
      </div>

      {/* Advanced Controls */}
      <div style={{ marginTop: '32px', borderTop: '1px solid #1a1a1a', paddingTop: '24px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🛠</span> Advanced (optional)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0A0A0A', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '8px 12px' }}>
             <span style={{ color: '#888', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>Location</span>
             <select 
               value={manualLocation} 
               onChange={e => setManualLocation(e.target.value)}
               style={{ background: 'transparent', border: 'none', color: '#E5E5E5', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none', cursor: 'pointer', textAlign: 'right' }}
             >
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Dubai">Dubai</option>
                <option value="Zurich, Switzerland">Zurich</option>
             </select>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onScan({ merchant: 'Custom Merchant', location: manualLocation, merchant_id: 'merch_custom', category: 'retail' })}
            style={{ 
              background: 'transparent', border: '1px solid #2a2a2a', color: '#A0A0A0', 
              padding: '12px', borderRadius: '10px', fontFamily: "'Space Grotesk', sans-serif", 
              fontSize: '13px', cursor: 'pointer', width: '100%' 
            }}
          >
            Launch Injection ➔
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default DemoScenarioGrid

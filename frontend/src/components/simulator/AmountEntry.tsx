import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Delete } from 'lucide-react'

interface MerchantInfo {
  merchant: string
  location: string
  merchant_id: string
  category: string
}

interface AmountEntryProps {
  merchant: MerchantInfo
  onSubmit: (amount: number) => void
}

const AmountEntry: React.FC<AmountEntryProps> = ({ merchant, onSubmit }) => {
  const [amountStr, setAmountStr] = useState('')

  const handleDigit = (d: string) => {
    if (d === '.' && amountStr.includes('.')) return
    if (amountStr === '0' && d !== '.') { setAmountStr(d); return }
    setAmountStr(prev => (prev + d).slice(0, 9))
  }

  const handleDelete = () => setAmountStr(prev => prev.slice(0, -1))

  const amount = parseFloat(amountStr || '0')
  const canPay = amount > 0

  const keys = ['1','2','3','4','5','6','7','8','9','.','0','⌫']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '360px', margin: '0 auto', padding: '24px 0' }}>

      {/* Merchant chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#111', border: '1px solid #1a1a1a', borderRadius: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #A78BFA22, #7C3AED22)', border: '1px solid #A78BFA33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '18px' }}>🏪</span>
        </div>
        <div>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#F5F5F5', margin: 0 }}>{merchant.merchant}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} /> {merchant.location} · {merchant.category}
          </p>
        </div>
      </div>


      {/* Amount display */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: '#666' }}>₹</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '52px', fontWeight: 800, color: '#F5F5F5', minWidth: '120px', textAlign: 'center' }}>
            {amountStr || '0'}
          </span>
        </div>

      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {keys.map(k => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.92 }}
            onClick={() => k === '⌫' ? handleDelete() : handleDigit(k)}
            style={{
              padding: '18px', background: k === '⌫' ? '#0D0D0D' : '#111',
              border: '1px solid #1a1a1a', borderRadius: '12px',
              color: k === '⌫' ? '#666' : '#F5F5F5',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {k === '⌫' ? <Delete size={20} /> : k}
          </motion.button>
        ))}
      </div>

      {/* Pay button */}
      <motion.button
        whileHover={canPay ? { scale: 1.02 } : {}}
        whileTap={canPay ? { scale: 0.98 } : {}}
        onClick={() => canPay && onSubmit(amount)}
        style={{
          padding: '16px', background: canPay ? 'linear-gradient(135deg, #A78BFA, #7C3AED)' : '#111',
          border: canPay ? 'none' : '1px solid #1a1a1a', borderRadius: '14px',
          color: canPay ? '#fff' : '#444', fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: '17px', cursor: canPay ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          boxShadow: canPay ? '0 8px 32px rgba(124,58,237,0.3)' : 'none',
        }}
      >
        {canPay ? `Pay ₹${parseFloat(amountStr).toLocaleString('en-IN')}` : 'Enter Amount'}
      </motion.button>
    </div>
  )
}

export default AmountEntry

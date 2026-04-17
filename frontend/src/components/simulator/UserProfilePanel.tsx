import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock, ShoppingBag, TrendingUp } from 'lucide-react'

interface PersonaProfile {
  userId: string
  displayName: string
  avatar: string
  badge: string
  badgeColor: string
  avgSpend: string
  category: string
  activeHours: string
  avgAmountNum: number
}

const PERSONAS: Record<string, PersonaProfile> = {
  demo_rahul: {
    userId: 'demo_rahul',
    displayName: 'Rahul',
    avatar: 'R',
    badge: 'Low Spender',
    badgeColor: '#10B981',
    avgSpend: '₹350',
    category: 'Grocery / Food',
    activeHours: 'Daytime (9AM–8PM)',
    avgAmountNum: 350,
  },
  demo_mehta: {
    userId: 'demo_mehta',
    displayName: 'Mehta',
    avatar: 'M',
    badge: 'High Spender',
    badgeColor: '#A78BFA',
    avgSpend: '₹18,000',
    category: 'Electronics / Travel',
    activeHours: 'Any time',
    avgAmountNum: 18000,
  },
}

interface LastDecision {
  userId: string
  amount: number
  decision: string
}

interface UserProfilePanelProps {
  selectedUser: string
  onUserChange: (userId: string) => void
  lastDecision: LastDecision | null
}

const decisionColors: Record<string, string> = {
  ALLOW: '#10B981',
  VERIFY: '#F59E0B',
  BLOCK: '#EF4444',
}
const decisionEmoji: Record<string, string> = {
  ALLOW: '🟢',
  VERIFY: '🟡',
  BLOCK: '🔴',
}

const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ selectedUser, onUserChange, lastDecision }) => {
  const profile = PERSONAS[selectedUser] || PERSONAS['demo_rahul']
  const otherUser = selectedUser === 'demo_rahul' ? 'demo_mehta' : 'demo_rahul'
  const otherProfile = PERSONAS[otherUser]

  // Show contrast when: we have a lastDecision AND the amounts involved are ₹20k-level
  const showContrast =
    lastDecision &&
    lastDecision.amount >= 15000 &&
    lastDecision.userId !== selectedUser

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* User Card */}
      <div style={{
        background: '#0D0D0D', border: '1px solid #1a1a1a',
        borderRadius: '16px', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${profile.badgeColor}30, ${profile.badgeColor}10)`,
            border: `2px solid ${profile.badgeColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 800,
            color: profile.badgeColor,
          }}>
            {profile.avatar}
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: '#F5F5F5' }}>
              {profile.displayName}
            </div>
            <div style={{
              display: 'inline-block', marginTop: '4px',
              padding: '2px 10px', borderRadius: '9999px',
              background: `${profile.badgeColor}15`, border: `1px solid ${profile.badgeColor}30`,
              fontFamily: "'Inter', sans-serif", fontSize: '11px',
              fontWeight: 600, color: profile.badgeColor,
            }}>
              {profile.badge}
            </div>
          </div>
        </div>

        {/* Behavioral Baseline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: <TrendingUp size={13} />, label: 'Avg Spend', value: profile.avgSpend },
            { icon: <ShoppingBag size={13} />, label: 'Category', value: profile.category },
            { icon: <Clock size={13} />, label: 'Active Hours', value: profile.activeHours },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#555', flexShrink: 0 }}>{item.icon}</div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#666', minWidth: '80px' }}>
                {item.label}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#D4D4D4', fontWeight: 500 }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Switcher */}
      <div style={{
        background: '#0D0D0D', border: '1px solid #1a1a1a',
        borderRadius: '14px', padding: '6px',
        display: 'flex', gap: '4px',
      }}>
        {Object.values(PERSONAS).map(p => (
          <button
            key={p.userId}
            onClick={() => onUserChange(p.userId)}
            style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
              cursor: 'pointer', transition: 'all 0.2s',
              background: selectedUser === p.userId ? `${p.badgeColor}20` : 'transparent',
              color: selectedUser === p.userId ? p.badgeColor : '#555',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 600,
              outline: selectedUser === p.userId ? `1px solid ${p.badgeColor}40` : 'none',
            }}
          >
            {p.displayName}
          </button>
        ))}
      </div>

      {/* Contrast Strip — mic drop moment */}
      <AnimatePresence>
        {showContrast && lastDecision && (
          <motion.div
            key="contrast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            style={{
              background: '#0D0D0D',
              border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: '14px', padding: '16px',
            }}
          >
            <div style={{
              fontFamily: 'monospace', fontSize: '10px', color: '#555',
              letterSpacing: '0.08em', marginBottom: '12px',
            }}>
              SAME TRANSACTION. DIFFERENT OUTCOME.
            </div>

            {[
              {
                name: PERSONAS[lastDecision.userId]?.displayName || lastDecision.userId,
                decision: lastDecision.decision,
              },
              {
                name: profile.displayName,
                decision: '???',
                pending: true,
              },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i === 0 ? '1px solid #1a1a1a' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#1a1a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700,
                    color: '#A0A0A0',
                  }}>
                    {row.name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, color: '#D4D4D4' }}>
                      {row.name}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555' }}>
                      ₹{lastDecision.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700,
                  color: row.pending ? '#555' : (decisionColors[row.decision] || '#A0A0A0'),
                }}>
                  {row.pending ? 'Submit →' : `${decisionEmoji[row.decision] || ''} ${row.decision}`}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { PERSONAS }
export type { PersonaProfile, LastDecision }
export default UserProfilePanel

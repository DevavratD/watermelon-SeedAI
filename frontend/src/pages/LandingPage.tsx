import React from 'react'
import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Gem, Bot, ArrowRight } from 'lucide-react'
import ApiDocs from '../components/ApiDocs'
import ShapeGrid from '../components/ShapeGrid'
import TextShuffle from '../components/TextShuffle'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const featurePills = [
  'Isolation Forest',
  'Vector DB',
  'Agentic Investigations',
  'Sub-Millisecond Execution',
  'Behavioral Context',
  'Real-Time Interception'
]

const featureCards = [
  {
    icon: Zap,
    title: 'Real-Time Interception',
    desc: 'Blocks malicious payloads in sub-second SLA before touching your core infrastructure.',
  },
  {
    icon: ShieldCheck,
    title: 'Behavioral ML Model',
    desc: 'Uses Isolation Forest architecture to detect anomaly clustering across multivariate dimensions.',
  },
  {
    icon: Gem,
    title: 'Agentic Workflow',
    desc: 'Llama 3.1 autonomously investigates flagged transactions generating a Suspicious Activity Report.',
  },
  {
    icon: Bot,
    title: 'Adaptive Friction',
    desc: 'Dynamically issues step-up OTP challenges instead of hard-blocking borderline transactions.',
  },
]

const CodeBlock: React.FC = () => {
  const purple = '#A78BFA'
  const orange = '#E8856A'
  const green = '#4ADE80'
  const white = '#F5F5F5'
  const muted = '#666'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: '16px',
        padding: '32px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
        lineHeight: '1.7', overflow: 'auto', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c940' }} />
      </div>

      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <span style={{ color: muted }}>POST</span>{' '}
        <span style={{ color: white }}>/api/v1/analyze-transaction</span>
        {'\n'}
        <span style={{ color: purple }}>{'   '}amount:</span>{' '}
        <span style={{ color: white }}>2450.00</span>
        {'\n'}
        <span style={{ color: purple }}>{'   '}location:</span>{' '}
        <span style={{ color: white }}>"Lagos, Nigeria"</span>
        {'\n\n'}
        <span style={{ color: muted }}>←</span>{' '}
        <span style={{ color: orange }}>200 OK — VERIFY</span>
        {'\n'}
        <span style={{ color: purple }}>{'   '}risk_score:</span>{' '}
        <span style={{ color: white }}>72.4</span>
        {'\n'}
        <span style={{ color: purple }}>{'   '}reason:</span>{' '}
        <span style={{ color: white }}>"Velocity anomaly detected"</span>
        {'\n\n'}
        <span style={{ color: muted }}>POST</span>{' '}
        <span style={{ color: white }}>/api/v1/verify-transaction</span>
        {'\n'}
        <span style={{ color: purple }}>{'   '}otp:</span>{' '}
        <span style={{ color: white }}>"123456"</span>
        {'\n\n'}
        <span style={{ color: muted }}>←</span>{' '}
        <span style={{ color: green }}>200 OK — ALLOW</span>
      </pre>
    </motion.div>
  )
}

const FeatureCard: React.FC<{ icon: React.ElementType, title: string, desc: string, index: number }> = ({ icon: Icon, title, desc, index }) => {
  const [hovered, setHovered] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0, cX: 0, cY: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y, cX: x - (rect.width / 2), cY: y - (rect.height / 2) })
  }

  const rotateX = hovered ? -(mousePos.cY / 25) : 0
  const rotateY = hovered ? (mousePos.cX / 25) : 0
  const tx = hovered ? (mousePos.cX / 15) : 0
  const ty = hovered ? (mousePos.cY / 15) : 0

  return (
    <motion.div
      ref={cardRef} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
      onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', background: '#111111', border: '1px solid transparent', borderRadius: '16px', padding: '32px',
        transform: hovered ? `translateY(-4px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)` : 'translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: hovered ? 'box-shadow 0.25s ease' : 'transform 0.4s ease-out, box-shadow 0.25s ease, border 0.3s ease',
        boxShadow: hovered ? '0 15px 40px rgba(167, 139, 250, 0.1)' : 'none',
        zIndex: hovered ? 10 : 1
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.8), transparent 40%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: 'none', borderRadius: '16px', zIndex: -2, margin: '-1px' }} />
      <div style={{ position: 'absolute', top: 1, left: 1, right: 1, bottom: 1, background: '#111111', borderRadius: '15px', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(167, 139, 250, 0.12), transparent 40%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, transform: `translate(${tx}px, ${ty}px)`, transition: hovered ? 'none' : 'transform 0.4s ease-out' }}>
        <div style={{ background: 'rgba(167,139,250,0.15)', borderRadius: '12px', padding: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: hovered ? 'scale(1.15) rotate(-5deg)' : 'scale(1) rotate(0deg)' }}>
          <Icon size={24} color="#A78BFA" />
        </div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 600, color: '#F5F5F5', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: '1.6', color: '#A0A0A0' }}>{desc}</p>
      </div>
    </motion.div>
  )
}

const LandingPage: React.FC = () => {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: '220px', paddingBottom: '180px', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background ShapeGrid */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '100%', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
          <ShapeGrid 
            speed={0.2} 
            squareSize={60}
            direction="diagonal"
            borderColor="rgba(167, 139, 250, 0.08)"
            hoverFillColor="rgba(167, 139, 250, 0.15)"
            shape="square"
            hoverTrailAmount={10}
          />
        </div>

        <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '0 5vw' }}>
          <motion.div custom={0} variants={fadeUp}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '9999px', padding: '8px 20px', fontSize: '13px', fontWeight: 500, color: '#A78BFA', marginBottom: '32px' }}>
              <ShieldCheck size={14} /> SeedAI Infrastructure · Telemetry Active
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#F5F5F5', maxWidth: '100%', width: '-webkit-fill-available', margin: '0 auto 24px' }}>
            <TextShuffle text="Analyze." duration={0.7} /><br />
            <TextShuffle text="Verify." duration={0.7} /><br />
            <span style={{ color: '#A78BFA' }}><TextShuffle text="Block." duration={0.7} /></span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.6, color: '#A0A0A0', maxWidth: '100%', width: '-webkit-fill-available', margin: '0 auto 40px' }}>
            A machine-learning anomaly detection engine. We identify threat patterns, inject verification challenges, and drop fraudulent payloads in real-time.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#docs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#A78BFA', color: '#fff', padding: '14px 32px', borderRadius: '9999px', fontSize: '15px', fontWeight: 600, transition: 'all 0.2s ease', textDecoration: 'none' }}>
              View API Reference <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── ARCHITECTURE ──────────────────────────── */}
      <section id="architecture" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', marginBottom: '48px' }} className="why-grid">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <span style={{ display: 'inline-block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A78BFA', marginBottom: '16px' }}>
                ENGINE ARCHITECTURE
              </span>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#F5F5F5', marginBottom: '20px' }}>
                The anomaly layer<br />for digital payments
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', lineHeight: 1.7, color: '#A0A0A0', maxWidth: '480px' }}>
                SeedAI intercepts every transaction moving through your pipeline and instantly measures it against the Isolation ML model. Dynamic rulesets drop impossible payloads instantly, while borderline payloads trigger step-up multi-factor challenges.
              </p>
            </motion.div>

            <CodeBlock />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {featurePills.map((pill) => (
              <span key={pill} style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, color: '#A0A0A0', background: '#111111', border: '1px solid #2a2a2a', borderRadius: '9999px', padding: '8px 20px' }}>
                {pill}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE CARDS ──── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ display: 'inline-block', fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#A78BFA', marginBottom: '16px' }}>CORE PLATFORM</span>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, color: '#F5F5F5', letterSpacing: '-0.02em' }}>
              Built for extreme telemetry
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {featureCards.map((card, i) => (
              <FeatureCard key={card.title} icon={card.icon} title={card.title} desc={card.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── API REFERENCE ──────────────────────────────────────── */}
      <section id="docs" style={{ padding: '100px 0' }}>
        <div className="container">
          <ApiDocs />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #1a1a1a' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#666' }}>
          Seed<span style={{ color: '#A78BFA' }}>AI</span> <span style={{ fontWeight: 400 }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Docs', 'GitHub', 'Discord'].map((link) => (
            <a key={link} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#666', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </div>
    </footer>

      <style>{`
        @media (max-width: 900px) {
          .why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default LandingPage

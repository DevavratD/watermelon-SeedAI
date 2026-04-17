import React, { useCallback, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&'

interface TextShuffleProps {
  text: string
  duration?: number  // seconds for the scramble to fully resolve
}

const TextShuffle: React.FC<TextShuffleProps> = ({ text, duration = 0.7 }) => {
  const [displayed, setDisplayed] = useState(text)
  const frameRef = useRef<number | null>(null)

  const triggerShuffle = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)

    let startTime: number | null = null
    const totalMs = duration * 1000

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / totalMs, 1)

      // Characters resolve left → right
      const resolvedCount = Math.floor(progress * text.length)

      const result = text
        .split('')
        .map((char, i) => {
          if (char === ' ' || char === '.') return char
          if (i < resolvedCount) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

      setDisplayed(result)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayed(text)
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(animate)
  }, [text, duration])

  return (
    <span
      onMouseEnter={triggerShuffle}
      style={{ cursor: 'default', display: 'inline-block' }}
    >
      {displayed}
    </span>
  )
}

export default TextShuffle

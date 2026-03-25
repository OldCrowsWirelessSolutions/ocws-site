'use client'
import Image from 'next/image'
import { speakCorvus } from '@/lib/elevenlabs'

const CORVUS_CLICK_LINES = [
  "Still here. Still correct. What do you need?",
  "You clicked on me. Bold move. Ask your question.",
  "I have opinions about your network. You should hear them.",
  "I was waiting for you to do that. What's broken?",
  "Don't poke the AI. Actually — go ahead. I don't mind.",
  "Yes?",
  "I'm listening. Make it worth my time.",
  "You found me. Good. Now ask me something.",
]

export default function CorvusClickableImage({
  width = 380,
  height = 480,
  className = "rounded-2xl object-cover",
  style,
}: {
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}) {
  const handleClick = () => {
    const line = CORVUS_CLICK_LINES[Math.floor(Math.random() * CORVUS_CLICK_LINES.length)]
    speakCorvus(line)
  }

  return (
    <Image
      src="/corvus_still.png"
      alt="Corvus"
      width={width}
      height={height}
      className={className}
      style={{ cursor: 'pointer', ...style }}
      onClick={handleClick}
    />
  )
}

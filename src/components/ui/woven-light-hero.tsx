interface WovenLightHeroProps {
  className?: string
}

export function WovenLightHero({ className = "" }: WovenLightHeroProps) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(211,255,67,0.5),rgba(255,239,218,0.28)_38%,transparent_70%)] blur-2xl ${className}`}
    />
  )
}

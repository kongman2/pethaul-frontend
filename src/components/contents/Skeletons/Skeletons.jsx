import './Skeletons.scss'

export function SkeletonHero() {
  return <div className="skeleton-hero" />
}

export function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-media" />
          <div className="skeleton-lines">
            <div />
            <div />
            <div />
          </div>
        </div>
      ))}
    </div>
  )
}

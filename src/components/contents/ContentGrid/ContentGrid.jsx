import ContentCard from '../ContentCard/ContentCard'
import './ContentGrid.scss'

export default function ContentGrid({ posts = [] }) {
  if (!posts.length) return null
  return (
    <section className="content-grid">
      {posts.map((p) => (
        <ContentCard key={p.id} post={p} />
      ))}
    </section>
  )
}

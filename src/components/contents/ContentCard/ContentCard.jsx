import { useNavigate } from 'react-router-dom'
import { getContentImageUrl } from '../../../utils/imageUtils'

import './ContentCard.scss'

export default function ContentCard({ post, onClick }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick(post)
    } else {
      navigate(`/contents/${post.id}`)
    }
  }

  const imageUrl = getContentImageUrl(post.coverUrl, post.thumbUrl || post.thumb)

  return (
    <article className="content-card" onClick={handleClick}>
      
      <div className="card-media">
        <img src={imageUrl} alt={post.title} />
      </div>
      <div className="card-body">
        {post.tag && <span className="card-tag">{post.tag}</span>}
        <h3 className="card-title">{post.title}</h3>
        {post.summary && <p className="card-desc">{post.summary}</p>}
        <div className="card-meta">
          <time>{post.publishedAt?.slice(0, 10) || post.date}</time>
          <span className="dot" />
          <span>{post.author}</span>
        </div>
      </div>
    </article>
  )
}

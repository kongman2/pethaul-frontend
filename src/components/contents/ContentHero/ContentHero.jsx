import './ContentHero.scss'

export default function ContentHero({ post, onClick }) {
   if (!post) return null
   return (
      <section className="content-hero" onClick={() => onClick?.(post)}>
         <div className="hero-media">
            <img src={post.coverUrl || post.cover} alt={post.title} />
            <div className="hero-overlay">
               {post.tag && <span className="hero-tag">{post.tag}</span>}
               <h2 className="hero-title">{post.title}</h2>
               {post.summary && <p className="hero-desc">{post.summary}</p>}
            </div>
         </div>
      </section>
   )
}

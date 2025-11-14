import ItemSectionGrid from '../common/ItemSectionGrid/ItemSectionGrid'

function BestProductsSection({ items = [], buildImg, titleOverride, iconOverride, sectionId = 'best-products' }) {
   return (
      <ItemSectionGrid
         id={sectionId}
         title={titleOverride || '오늘의 BEST HAUL'}
         icon={iconOverride || 'streamline-pixel:entertainment-events-hobbies-reward-winner-talent'}
         moreHref="/items/sorted?sort=topToday"
         items={items}
         buildImg={buildImg}
         getHref={(_, itemId) => (itemId != null ? `/items/detail/${itemId}` : undefined)}
      />
   )
}

export default BestProductsSection


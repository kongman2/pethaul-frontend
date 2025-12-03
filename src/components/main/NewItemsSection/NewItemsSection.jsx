import ItemSectionGrid from '../common/ItemSectionGrid/ItemSectionGrid'

import './NewItemsSection.scss'

function NewItemsSection({ items = [], buildImg }) {
   const emptyMessage = <p className="new-items__empty">지금 준비 중입니다. 곧 따끈한 신상품을 만나보세요!</p>

   return (
      <ItemSectionGrid
         id="ss-new"
         title="2025 F/W 신상템"
         icon="streamline-pixel:interface-essential-crown"
         moreHref="/items/search?filter=신상품"
         items={items}
         maxItems={4}
         buildImg={buildImg}
         emptyMessage={emptyMessage}
         getHref={(_, itemId) => (itemId != null ? `/items/detail/${itemId}` : undefined)}
      />
   )
}

export default NewItemsSection


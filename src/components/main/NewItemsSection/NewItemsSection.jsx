import ItemSectionGrid from '../common/ItemSectionGrid/ItemSectionGrid'

import './NewItemsSection.scss'

function NewItemsSection({ items = [], buildImg }) {
   return (
      <ItemSectionGrid
         id="ss-new"
         title="2025 F/W 신상템"
         icon="streamline-pixel:interface-essential-crown"
         moreHref="/items/sorted?sort=newItems&filter=신상"
         items={items}
         maxItems={4}
         buildImg={buildImg}
         getHref={(_, itemId) => (itemId != null ? `/items/detail/${itemId}` : undefined)}
      />
   )
}

export default NewItemsSection


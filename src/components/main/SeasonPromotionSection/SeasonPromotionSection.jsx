import PropTypes from 'prop-types'

import ItemSectionGrid from '../common/ItemSectionGrid/ItemSectionGrid'

import './SeasonPromotionSection.scss'

function SeasonPromotionSection({ items = [], buildImg }) {
  const emptyMessage = <p className="season-promotion__empty">지금 준비 중입니다. 곧 따끈한 시즌 아이템을 만나보세요!</p>

  return (
    <div className="season-promotion mt-5">
      <ItemSectionGrid
        id="season-promotion"
        title="따끈한 냥이 한마리 몰고 가세요~"
        icon="streamline-pixel:health-drugs-cannabis"
        moreHref="/items/search?filter=시즌"
        moreLabel="More"
        items={items}
        maxItems={4}
        buildImg={buildImg}
        emptyMessage={emptyMessage}
      />
    </div>
  )
}

SeasonPromotionSection.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  buildImg: PropTypes.func,
}

export default SeasonPromotionSection

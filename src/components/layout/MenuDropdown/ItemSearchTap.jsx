import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../common'
import './ItemSearchTap.scss'

function ItemSearchTap({ onClose = () => {} }) {
  const FilterButton = ({ value, label, icon, to, state }) => {
    const destination = to ?? (value ? `/items/search?filter=${encodeURIComponent(value)}` : '/item')
    const linkState = state === undefined ? { sellCategory: value ?? '' } : state

    return (
      <Link
        to={destination}
        state={linkState}
        onClick={onClose}
         className="btn-link-reset"
      >
        <Button variant="dropdown" size="sm" fullWidth icon={icon}>
          {label ?? value}
        </Button>
      </Link>
   )
  }

   return (
    <section id="item-search-tap" className="item-search-tap py-4 py-sm-0">
      <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
        <div className="d-flex justify-content-center">
          <FilterButton label="전체상품보기" value="" />
        </div>
        <div className="d-flex justify-content-center">
          <FilterButton label="세일상품" value="세일" />
        </div>
         </div>

      <div className="filter-group mb-4">
        <h3 className="h6 mb-3">반려동물</h3>
        <div className="d-flex flex-wrap gap-2">
          <div className="d-flex justify-content-center">
            <FilterButton
              value="강아지"
              icon={
                <Icon icon="fluent-emoji-flat:dog" width="24" height="24" />
              }
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton
              value="고양이"
              icon={
             <Icon icon="noto:black-cat" width="24" height="24" />
              }
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton
              value="햄스터/고슴도치"
              icon={<Icon icon="noto:hedgehog" width="24" height="24" />}
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton
              value="토끼"
              icon={<Icon icon="noto:rabbit-face" width="24" height="24" />}
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton
              value="새(앵무새)"
              icon={<Icon icon="noto:parrot" width="24" height="24" />}
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton
              value="물고기/기타동물"
              icon={<Icon icon="noto:tropical-fish" width="24" height="24" />}
            />
          </div>
            </div>
         </div>

      <div className="filter-group mb-4">
        <h3 className="h6 mb-3">추천</h3>
        <div className="d-flex flex-wrap gap-2">
          <div className="d-flex justify-content-center">
            <FilterButton
              value="무료배송"
              icon={<Icon icon="mdi:truck-delivery-outline" width="20" height="20" />}
            />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="이벤트" icon={<Icon icon="mdi:party-popper" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="SEASON" icon={<Icon icon="mdi:weather-snowy-rainy" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="빠른배송" icon={<Icon icon="mdi:lightning-bolt" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="기획전" icon={<Icon icon="mdi:star-box-multiple" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="이월상품" icon={<Icon icon="mdi:tag-multiple-outline" width="20" height="20" />} />
          </div>
            </div>
         </div>

      <div className="filter-group mb-4">
        <h3 className="h6 mb-3">카테고리</h3>
        <div className="d-flex flex-wrap gap-2">
          <div className="d-flex justify-content-center">
            <FilterButton value="사료" icon={<Icon icon="mdi:food-drumstick" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="간식" icon={<Icon icon="mdi:candy-outline" width="20" height="20" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="의류" icon={<Icon icon="fluent:clothes-hanger-24-filled" width="24" height="24" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="산책용품" icon={<Icon icon="carbon:dog-walker" width="24" height="24" />} />
          </div>
            <div className="d-flex justify-content-center">
            <FilterButton value="장난감" icon={<Icon icon="svg-spinners:bouncing-ball" width="24" height="24" /> } />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="배변용품" icon={<Icon icon="mdi:emoticon-poop" width="24" height="24" />} />
          </div>
          <div className="d-flex justify-content-center">
            <FilterButton value="기타용품" icon={<Icon icon="mdi:apps-box" width="20" height="20" />} />
          </div>
            </div>
         </div>
      </section>
  );
}

export default memo(ItemSearchTap);

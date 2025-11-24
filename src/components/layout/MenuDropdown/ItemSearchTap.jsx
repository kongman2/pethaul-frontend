import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Button } from '../../common'
import { PET_CATEGORY_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from '../../../constants/itemCategories'
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
          {PET_CATEGORY_OPTIONS.map((option) => {
            // 아이콘 매핑
            const iconMap = {
              '강아지': <Icon icon="fluent-emoji-flat:dog" width="24" height="24" />,
              '고양이': <Icon icon="noto:black-cat" width="24" height="24" />,
              '햄스터/고슴도치': <Icon icon="noto:hedgehog" width="24" height="24" />,
              '토끼': <Icon icon="noto:rabbit-face" width="24" height="24" />,
              '새(앵무새)': <Icon icon="noto:parrot" width="24" height="24" />,
              '물고기/기타동물': <Icon icon="noto:tropical-fish" width="24" height="24" />,
            }
            return (
              <div key={option.value} className="d-flex justify-content-center">
                <FilterButton
                  value={option.value}
                  icon={iconMap[option.value]}
                />
              </div>
            )
          })}
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
          {PRODUCT_CATEGORY_OPTIONS.map((option) => {
            // 아이콘 매핑
            const iconMap = {
              '사료': <Icon icon="mdi:food-drumstick" width="20" height="20" />,
              '간식': <Icon icon="mdi:candy-outline" width="20" height="20" />,
              '의류': <Icon icon="fluent:clothes-hanger-24-filled" width="24" height="24" />,
              '산책용품': <Icon icon="carbon:dog-walker" width="24" height="24" />,
              '장난감': <Icon icon="svg-spinners:bouncing-ball" width="24" height="24" />,
              '배변용품': <Icon icon="mdi:emoticon-poop" width="24" height="24" />,
              '기타용품': <Icon icon="mdi:apps-box" width="20" height="20" />,
            }
            return (
              <div key={option.value} className="d-flex justify-content-center">
                <FilterButton
                  value={option.value}
                  icon={iconMap[option.value]}
                />
              </div>
            )
          })}
        </div>
      </div>
      </section>
  );
}

export default memo(ItemSearchTap);

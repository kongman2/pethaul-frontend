import { 
  PET_CATEGORY_OPTIONS, 
  PRODUCT_CATEGORY_OPTIONS, 
  SPECIAL_CATEGORY_OPTIONS,
  RECOMMENDED_CATEGORY_OPTIONS 
} from '../constants/itemCategories'
import { RECOMMENDATION_TAGS } from './recommendationUtils'

const DEFAULT_GET_CATEGORIES = (item) => item?.Categories ?? []
const DEFAULT_GET_SELL_STATUS = (item) => item?.itemSellStatus ?? item?.sellStatus
const DEFAULT_GET_STOCK = (item) => item?.stockNumber ?? item?.stock ?? item?.quantity
const DEFAULT_GET_PRICE = (item) => item?.price ?? item?.Price?.amount ?? item?.amount

const toCategorySet = (value) => {
  if (!value) return new Set()
  if (value instanceof Set) return value
  if (Array.isArray(value)) return new Set(value.filter(Boolean).map(String))
  return new Set([String(value)])
}

const parseNumericFilter = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

const extractCategoryNames = (categories) => {
  if (!categories) return []
  return categories
    .map((c) => (typeof c === 'string' ? c : c?.categoryName ?? c?.name))
    .filter(Boolean)
    .map(String)
}

/**
 * 카테고리 옵션에서 자동으로 매핑 맵 생성
 */
// 모든 카테고리 옵션 수집
const ALL_CATEGORY_OPTIONS = [
  ...PET_CATEGORY_OPTIONS,
  ...PRODUCT_CATEGORY_OPTIONS,
  ...SPECIAL_CATEGORY_OPTIONS,
  ...RECOMMENDED_CATEGORY_OPTIONS,
]

// 추천 태그도 매핑에 포함 (value가 문자열이므로 직접 처리)
const buildCategoryMapping = () => {
  const mapping = {}
  
  // 카테고리 옵션에서 매핑 생성
  ALL_CATEGORY_OPTIONS.forEach(option => {
    const value = option.value
    // value 자체를 매핑
    mapping[value] = value
    mapping[value.toUpperCase()] = value
    mapping[value.toLowerCase()] = value
    
    // aliases가 있으면 모두 매핑
    if (option.aliases && Array.isArray(option.aliases)) {
      option.aliases.forEach(alias => {
        mapping[alias] = value
        mapping[alias.toUpperCase()] = value
        mapping[alias.toLowerCase()] = value
        // 공백 제거 버전도 매핑 (예: "free shipping" -> "freeshipping")
        const noSpace = alias.replace(/\s+/g, '')
        if (noSpace !== alias) {
          mapping[noSpace] = value
          mapping[noSpace.toUpperCase()] = value
          mapping[noSpace.toLowerCase()] = value
        }
      })
    }
  })
  
  // 추천 태그 매핑 (추가 별칭이 필요한 경우)
  const tagAliases = {
    '침대': ['bed', 'beds', 'mattress'],
    '장난감': ['toy', 'toys', 'play'],
    '간식': ['snack', 'treat', 'treats'],
    '사료': ['feed', 'food', 'petfood'],
    '하우스': ['house', 'hut'],
    '은신처': ['hideout', 'hide'],
    '활동용품': ['activity', 'exercise'],
    '산책용품': ['walking', 'walk'],
    '의류': ['clothing', 'apparel', 'clothes'],
    '위생용품': ['hygiene', 'sanitation'],
    '건강관리': ['health', 'care'],
    '미용용품': ['grooming', 'beauty'],
    '생활용품': ['living', 'daily'],
    '급식기': ['feeder', 'bowl'],
    '급수기': ['waterer', 'water bowl'],
    '목줄': ['collar', 'leash'],
    '하네스': ['harness'],
    '리드줄': ['lead', 'leash'],
    '캐리어': ['carrier', 'crate'],
    '이동장': ['transport', 'carrier'],
    '시즌': ['season', 'seasons'],
    '키링': ['keyring', 'key ring', 'keychain'],
    '이벤트': ['event', 'events'],
    '세일': ['sale', 'sales', 'discount'],
  }
  
  RECOMMENDATION_TAGS.forEach(tag => {
    mapping[tag] = tag
    mapping[tag.toUpperCase()] = tag
    mapping[tag.toLowerCase()] = tag
    
    if (tagAliases[tag]) {
      tagAliases[tag].forEach(alias => {
        mapping[alias] = tag
        mapping[alias.toUpperCase()] = tag
        mapping[alias.toLowerCase()] = tag
      })
    }
  })
  
  return mapping
}

const CATEGORY_MAPPING = buildCategoryMapping()

/**
 * 카테고리 이름 정규화 (영어/한글 구분 없이 매칭)
 */
export const normalizeCategoryName = (name) => {
  if (!name) return ''
  const str = String(name).trim()
  const upper = str.toUpperCase()
  const lower = str.toLowerCase()
  
  // 매핑 테이블에서 찾기 (원본, 대문자, 소문자 모두 확인)
  if (CATEGORY_MAPPING[str]) {
    return CATEGORY_MAPPING[str]
  }
  if (CATEGORY_MAPPING[upper]) {
    return CATEGORY_MAPPING[upper]
  }
  if (CATEGORY_MAPPING[lower]) {
    return CATEGORY_MAPPING[lower]
  }
  
  // 공백 제거 버전도 확인
  const noSpace = str.replace(/\s+/g, '')
  if (noSpace !== str && CATEGORY_MAPPING[noSpace]) {
    return CATEGORY_MAPPING[noSpace]
  }
  if (noSpace !== str && CATEGORY_MAPPING[noSpace.toUpperCase()]) {
    return CATEGORY_MAPPING[noSpace.toUpperCase()]
  }
  
  // 매핑에 없으면 원본 반환 (대문자로)
  return upper
}

export function filterItems(items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) return []

  const {
    selectedCategories = [],
    sellStatus = '',
    inStockOnly = false,
    inStockStatus,
    priceMin = null,
    priceMax = null,
    getCategories = DEFAULT_GET_CATEGORIES,
    getSellStatus = DEFAULT_GET_SELL_STATUS,
    getStock = DEFAULT_GET_STOCK,
    getPrice = DEFAULT_GET_PRICE,
  } = options

  // 선택된 카테고리를 정규화된 형태로 변환
  const normalizedSelectedCategories = selectedCategories.map(normalizeCategoryName)
  const selectedSet = toCategorySet(normalizedSelectedCategories)
  const min = parseNumericFilter(priceMin)
  const max = parseNumericFilter(priceMax)

  return items.filter((item) => {
    if (selectedSet.size > 0) {
      const names = extractCategoryNames(getCategories(item))
      // 아이템의 카테고리도 정규화하여 비교
      const normalizedNames = names.map(normalizeCategoryName)
      const hasMatch = normalizedNames.some((name) => selectedSet.has(name))
      if (!hasMatch) return false
    }

    if (sellStatus) {
      const status = getSellStatus(item)
      if (status !== sellStatus) return false
    }

    if (inStockOnly) {
      const stock = getStock(item)
      if (!(Number(stock) > 0)) return false
      if (inStockStatus && getSellStatus(item) !== inStockStatus) return false
    }

    if (min !== null || max !== null) {
      const price = parseNumericFilter(getPrice(item))
      if (price === null) return false
      if (min !== null && price < min) return false
      if (max !== null && price > max) return false
    }

    return true
  })
}


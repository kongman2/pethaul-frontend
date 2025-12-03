/**
 * 아이템 서치 탭의 큰 카테고리 옵션
 * 반려동물 카테고리와 상품 카테고리로 구성
 */
export const MAIN_CATEGORY_OPTIONS = [
  // 반려동물 카테고리
  { value: '강아지', label: '강아지', group: '반려동물' },
  { value: '고양이', label: '고양이', group: '반려동물' },
  { value: '햄스터/고슴도치', label: '햄스터/고슴도치', group: '반려동물' },
  { value: '토끼', label: '토끼', group: '반려동물' },
  { value: '새(앵무새)', label: '새(앵무새)', group: '반려동물' },
  { value: '물고기/기타동물', label: '물고기/기타동물', group: '반려동물' },
  // 상품 카테고리
  { value: '사료', label: '사료', group: '카테고리' },
  { value: '간식', label: '간식', group: '카테고리' },
  { value: '의류', label: '의류', group: '카테고리' },
  { value: '산책용품', label: '산책용품', group: '카테고리' },
  { value: '장난감', label: '장난감', group: '카테고리' },
  { value: '배변용품', label: '배변용품', group: '카테고리' },
  { value: '기타용품', label: '기타용품', group: '카테고리' },
  // 특별 카테고리
  { value: '무료배송', label: '무료배송', group: '카테고리' },
  { value: '빠른배송', label: '빠른배송', group: '카테고리' },
  { value: 'SEASON', label: 'SEASON', group: '카테고리' },
  { value: '신상품', label: '신상품', group: '카테고리' },
  { value: '이월상품', label: '이월상품', group: '카테고리' },
]

/**
 * 반려동물 카테고리만 필터링
 */
export const PET_CATEGORY_OPTIONS = MAIN_CATEGORY_OPTIONS.filter(
  (option) => option.group === '반려동물'
)

/**
 * 상품 카테고리만 필터링
 */
export const PRODUCT_CATEGORY_OPTIONS = MAIN_CATEGORY_OPTIONS.filter(
  (option) => option.group === '카테고리'
)

/**
 * 추천 카테고리 옵션
 */
export const RECOMMENDED_CATEGORY_OPTIONS = [
  { value: '무료배송', label: '무료배송', group: '추천' },
  { value: '이벤트', label: '이벤트', group: '추천' },
  { value: 'SEASON', label: 'SEASON', group: '추천' },
  { value: '빠른배송', label: '빠른배송', group: '추천' },
  { value: '신상품', label: '신상품', group: '추천' },
  { value: '이월상품', label: '이월상품', group: '추천' },
]

/**
 * 카테고리 값만 추출 (value 배열)
 */
export const MAIN_CATEGORY_VALUES = MAIN_CATEGORY_OPTIONS.map((option) => option.value)


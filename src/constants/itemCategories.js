/**
 * 반려동물 카테고리 옵션
 * aliases: 영어 검색어 배열 (자동 매핑용)
 */
export const PET_CATEGORY_OPTIONS = [
  { value: '강아지', label: '강아지', group: '반려동물', aliases: ['dog', 'dogs', 'puppy', 'puppies'] },
  { value: '고양이', label: '고양이', group: '반려동물', aliases: ['cat', 'cats', 'kitty', 'kitten'] },
  { value: '햄스터/고슴도치', label: '햄스터/고슴도치', group: '반려동물', aliases: ['hamster', 'hedgehog', '햄스터', '고슴도치'] },
  { value: '토끼', label: '토끼', group: '반려동물', aliases: ['rabbit', 'bunny'] },
  { value: '새(앵무새)', label: '새(앵무새)', group: '반려동물', aliases: ['bird', 'birds', 'parrot', '새', '앵무새'] },
  { value: '물고기/기타동물', label: '물고기/기타동물', group: '반려동물', aliases: ['fish', 'other', 'others', '물고기', '기타동물'] },
]

/**
 * 기본 상품 카테고리 옵션 (메뉴 드롭다운의 카테고리 섹션용)
 */
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: '사료', label: '사료', group: '카테고리', aliases: ['feed', 'food', 'petfood', 'pet food'] },
  { value: '간식', label: '간식', group: '카테고리', aliases: ['snack', 'treat', 'treats'] },
  { value: '의류', label: '의류', group: '카테고리', aliases: ['clothing', 'apparel', 'clothes'] },
  { value: '산책용품', label: '산책용품', group: '카테고리', aliases: ['walking', 'walk', '산책'] },
  { value: '장난감', label: '장난감', group: '카테고리', aliases: ['toy', 'toys', 'play'] },
  { value: '배변용품', label: '배변용품', group: '카테고리', aliases: ['litter', 'toilet', '배변'] },
  { value: '기타용품', label: '기타용품', group: '카테고리', aliases: ['etc', 'other', '기타'] },
]

/**
 * 특별 카테고리 옵션 (상품 등록 폼용)
 */
export const SPECIAL_CATEGORY_OPTIONS = [
  { value: '무료배송', label: '무료배송', group: '카테고리', aliases: ['freeshipping', 'free shipping', 'free', '무료'] },
  { value: '빠른배송', label: '빠른배송', group: '카테고리', aliases: ['fastshipping', 'fast shipping', 'fast', '빠른'] },
  { value: 'SEASON', label: 'SEASON', group: '카테고리', aliases: ['season', 'seasons', '시즌'] },
  { value: '신상품', label: '신상품', group: '카테고리', aliases: ['new', 'newitem', 'new item', '신상'] },
  { value: '이월상품', label: '이월상품', group: '카테고리', aliases: ['clearance', 'sale', '이월'] },
]

/**
 * 추천 카테고리 옵션 (메뉴 드롭다운의 추천 섹션용)
 */
export const RECOMMENDED_CATEGORY_OPTIONS = [
  { value: '무료배송', label: '무료배송', group: '추천', aliases: ['freeshipping', 'free shipping', 'free', '무료'] },
  { value: '이벤트', label: '이벤트', group: '추천', aliases: ['event', 'events'] },
  { value: 'SEASON', label: 'SEASON', group: '추천', aliases: ['season', 'seasons', '시즌'] },
  { value: '빠른배송', label: '빠른배송', group: '추천', aliases: ['fastshipping', 'fast shipping', 'fast', '빠른'] },
  { value: '신상품', label: '신상품', group: '추천', aliases: ['new', 'newitem', 'new item', '신상'] },
  { value: '이월상품', label: '이월상품', group: '추천', aliases: ['clearance', 'sale', '이월'] },
]

/**
 * 상품 등록 폼용 전체 카테고리 옵션 (반려동물 + 기본 상품 + 특별 카테고리)
 */
export const MAIN_CATEGORY_OPTIONS = [
  ...PET_CATEGORY_OPTIONS,
  ...PRODUCT_CATEGORY_OPTIONS,
  ...SPECIAL_CATEGORY_OPTIONS,
]

/**
 * 카테고리 값만 추출 (value 배열)
 */
export const MAIN_CATEGORY_VALUES = MAIN_CATEGORY_OPTIONS.map((option) => option.value)


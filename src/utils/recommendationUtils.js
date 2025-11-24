/**
 * 추천 상품 텍스트에서 핵심 키워드 추출
 * 예: "편안한 침대" -> "침대", "운동량이 많은 장난감" -> "장난감"
 */
export const extractRecommendationKeyword = (recommendationText) => {
  if (!recommendationText) return ''
  
  const text = recommendationText.trim()
  
  // 슬래시로 구분된 경우 첫 번째 또는 마지막 단어 사용
  if (text.includes('/')) {
    const parts = text.split('/').map(p => p.trim()).filter(Boolean)
    // 더 짧은 단어를 우선 (예: "은신처/하우스" -> "하우스")
    return parts.sort((a, b) => a.length - b.length)[0] || parts[0] || text
  }
  
  // 일반적인 형용사/수식어 제거 패턴
  const modifiers = [
    '편안한', '편리한', '안전한', '부드러운', '따뜻한', '시원한',
    '운동량이 많은', '활동적인', '인터랙티브', '퍼즐', '다양한',
    '조용한', '은은한', '강력한', '효과적인', '프리미엄', '고급',
    '휴대용', '대형', '소형', '중형', '미니', '스마트',
    '자동', '수동', '전동', '무선', '유선'
  ]
  
  // 수식어 제거
  let keyword = text
  for (const modifier of modifiers) {
    if (keyword.startsWith(modifier)) {
      keyword = keyword.replace(modifier, '').trim()
      break
    }
  }
  
  // 여전히 공백이 있으면 마지막 단어 사용 (예: "운동량이 많은 장난감" -> "장난감")
  if (keyword.includes(' ')) {
    const words = keyword.split(' ').filter(w => w.length > 0)
    // 마지막 단어가 더 구체적인 경우가 많음
    keyword = words[words.length - 1] || keyword
  }
  
  // 빈 문자열이면 원본 반환
  return keyword || text
}

/**
 * 추천 상품 목록에서 모든 키워드 추출
 */
export const extractRecommendationKeywords = (recommendations) => {
  if (!Array.isArray(recommendations)) return []
  return recommendations.map(extractRecommendationKeyword).filter(Boolean)
}

/**
 * 일반적인 추천 상품 태그 목록 (상품 등록 시 선택용)
 */
export const RECOMMENDATION_TAGS = [
  '침대',
  '장난감',
  '간식',
  '사료',
  '하우스',
  '은신처',
  '활동용품',
  '산책용품',
  '의류',
  '위생용품',
  '건강관리',
  '미용용품',
  '생활용품',
  '급식기',
  '급수기',
  '목줄',
  '하네스',
  '리드줄',
  '캐리어',
  '이동장',
]


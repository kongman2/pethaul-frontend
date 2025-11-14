import 강아지Img from '../../../assets/강아지.png'
import 고양이Img from '../../../assets/고양이.png'
import 햄스터Img from '../../../assets/햄스터.png'
import 토끼Img from '../../../assets/토끼.png'
import 새Img from '../../../assets/새.png'
import 고슴도치Img from '../../../assets/고슴도치.png'
import 물고기Img from '../../../assets/물고기.png'

export const BREED_OPTIONS = {
  강아지: [
    '포메라니안',
    '말티즈',
    '푸들',
    '웰시코기',
    '진돗개',
    '비숑',
    '치와와',
    '닥스훈트',
    '리트리버',
    '시츄',
  ],
  고양이: [
    '코리안숏헤어',
    '페르시안',
    '러시안블루',
    '스코티시폴드',
    '브리티시숏헤어',
    '아메리칸숏헤어',
    '렉돌',
    '뱅갈',
    '샴',
    '아비시니안',
  ],
  햄스터: ['골든햄스터', '드워프햄스터', '로보로브스키햄스터', '캠벨햄스터'],
  토끼: ['네덜란드드워프', '미니렉스', '라이온헤드', '롭이어', '앙고라'],
  '새(앵무새)': ['왕관앵무', '모란앵무', '사랑앵무', '코뉴어', '아마존앵무'],
  고슴도치: ['아프리카피그미고슴도치', '유럽고슴도치'],
  '물고기/기타동물': ['금붕어', '구피', '베타', '거북이', '기타'],
}

export const BASE_SURVEY_QUESTIONS = [
  {
    id: 1,
    question: '어떤 반려동물을 키우시나요?',
    type: 'petType',
    options: [
      { label: '강아지', value: '강아지', image: 강아지Img, className: 'pet-img1' },
      { label: '고양이', value: '고양이', image: 고양이Img, className: 'pet-img3' },
      { label: '햄스터', value: '햄스터', image: 햄스터Img, className: 'pet-img2' },
      { label: '토끼', value: '토끼', image: 토끼Img, className: 'pet-img3' },
      { label: '새(앵무새)', value: '새(앵무새)', image: 새Img, className: 'pet-img3' },
      { label: '고슴도치', value: '고슴도치', image: 고슴도치Img, className: 'pet-img3' },
      { label: '물고기/기타동물', value: '물고기/기타동물', image: 물고기Img, className: 'pet-img3' },
    ],
  },
  {
    id: 2,
    question: '반려동물의 이름은 무엇인가요?',
    type: 'petName',
    inputType: 'text',
    placeholder: '예: 뽀미',
  },
  {
    id: 3,
    question: '반려동물의 성별은?',
    type: 'gender',
    options: [
      { label: '남아 ♂️', value: 'M' },
      { label: '여아 ♀️', value: 'F' },
    ],
  },
  {
    id: 4,
    question: '몇 살인가요?',
    type: 'age',
    options: [
      { label: '1살 미만 (개월 수 입력)', value: 'under_1' },
      { label: '1-11살 (나이 입력)', value: '1_to_11' },
      { label: '12살 이상 (나이 입력)', value: 'over_12' },
    ],
    requiresInput: true,
  },
  {
    id: 6,
    question: '활동성은 어느 정도인가요?',
    type: 'activity',
    options: [
      { label: '매우 활발해요', value: 'very_active' },
      { label: '활발한 편이에요', value: 'active' },
      { label: '보통이에요', value: 'moderate' },
      { label: '조용한 편이에요', value: 'calm' },
      { label: '매우 조용해요', value: 'very_calm' },
    ],
  },
  {
    id: 7,
    question: '성격은 어떤가요?',
    type: 'personality',
    options: [
      { label: '친화적이고 외향적', value: 'friendly' },
      { label: '독립적이고 차분함', value: 'independent' },
      { label: '장난스럽고 호기심 많음', value: 'playful' },
      { label: '예민하고 소심함', value: 'sensitive' },
      { label: '용감하고 대담함', value: 'brave' },
    ],
  },
  {
    id: 8,
    question: '사람과의 친밀도는?',
    type: 'sociability',
    options: [
      { label: '모두와 친해요', value: 'very_social' },
      { label: '익숙한 사람만 좋아해요', value: 'selective' },
      { label: '주인만 좋아해요', value: 'owner_only' },
      { label: '혼자 있는 걸 좋아해요', value: 'independent' },
    ],
  },
  {
    id: 9,
    question: '반려동물 사진을 등록해주세요',
    type: 'petImage',
    isOptional: true,
    fileUpload: true,
  },
]


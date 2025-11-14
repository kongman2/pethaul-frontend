const activityRecommendations = {
  강아지: {
    energetic: ['공원 산책', '어질리티 훈련', '친구들과 놀이'],
    playful: ['공놀이', '프리스비', '새로운 트릭 배우기'],
    independent: ['혼자 산책', '냄새 탐험', '정원 둘러보기'],
    sensitive: ['조용한 산책', '단둘이 시간', '편안한 그루밍'],
    brave: ['등산', '수영', '새로운 장소 탐험'],
    friendly: ['애견카페', '친구들과 만남', '공원 산책'],
    balanced: ['산책', '놀이', '휴식 등 다양하게'],
  },
  고양이: {
    energetic: ['캣타워 오르기', '깃털 장난감 놀이', '레이저 포인터'],
    playful: ['사냥 놀이', '숨바꼭질', '상자 탐험'],
    independent: ['창밖 구경', '햇빛 쬐기', '높은 곳에서 관찰'],
    sensitive: ['조용한 스킨십', '브러싱', '안전한 공간에서 휴식'],
    brave: ['새로운 장난감 도전', '높은 곳 등반', '집 안 탐험'],
    friendly: ['함께 놀이', '그루밍', '무릎 위에서 낮잠'],
    balanced: ['캣타워', '장난감 놀이', '휴식 등 다양하게'],
  },
  햄스터: {
    energetic: ['러닝휠 달리기', '터널 탐험', '케이지 밖 시간'],
    playful: ['미로 탐험', '간식 찾기', '새로운 장난감'],
    independent: ['은신처에서 휴식', '먹이 모으기', '조용히 관찰'],
    sensitive: ['안전한 환경', '부드러운 접촉', '조용한 시간'],
    brave: ['새로운 공간 탐험', '장애물 넘기', '손 위에서 놀기'],
    friendly: ['손 위에서 간식', '부드러운 쓰다듬기', '함께 시간'],
    balanced: ['러닝휠', '터널', '휴식 등 다양하게'],
  },
  토끼: {
    energetic: ['실내 뛰어다니기', '장애물 뛰어넘기', '탐험 시간'],
    playful: ['공 밀기', '터널 통과', '숨바꼭질'],
    independent: ['조용히 먹이 먹기', '털 정리', '편안히 쉬기'],
    sensitive: ['조용한 환경', '부드러운 쓰다듬기', '안전한 공간'],
    brave: ['새로운 장소 탐험', '다양한 장난감', '높낮이 오르기'],
    friendly: ['함께 놀이', '손에서 간식', '쓰다듬기'],
    balanced: ['뛰어다니기', '놀이', '휴식 등 다양하게'],
  },
  '새(앵무새)': {
    energetic: ['날개 펼치기', '장난감 놀이', '말하기 연습'],
    playful: ['퍼즐 장난감', '종 흔들기', '거울 놀이'],
    independent: ['횃대에서 관찰', '혼자 놀이', '조용히 쉬기'],
    sensitive: ['조용한 환경', '부드러운 말걸기', '안전한 공간'],
    brave: ['새로운 장난감', '손 위 연습', '실내 비행'],
    friendly: ['어깨에 앉기', '말 배우기', '함께 놀이'],
    balanced: ['장난감', '비행 시간', '휴식 등 다양하게'],
  },
  고슴도치: {
    energetic: ['러닝휠', '탐험 시간', '케이지 밖 활동'],
    playful: ['터널 놀이', '새로운 냄새 탐험', '간식 찾기'],
    independent: ['은신처 휴식', '혼자 먹이 먹기', '조용한 관찰'],
    sensitive: ['조용한 환경', '천천히 접근', '안전한 공간'],
    brave: ['새로운 환경', '손 위 탐험', '다양한 장난감'],
    friendly: ['손에서 간식', '부드러운 접촉', '함께 시간'],
    balanced: ['러닝휠', '탐험', '휴식 등 다양하게'],
  },
  '물고기/기타동물': {
    energetic: ['수조 탐험', '먹이 사냥', '활동적인 환경'],
    playful: ['장식물 탐험', '먹이 놀이', '다양한 환경'],
    independent: ['조용한 환경', '숨을 곳', '편안한 공간'],
    sensitive: ['안정적인 환경', '적절한 온도', '조용함'],
    brave: ['새로운 장식', '다양한 먹이', '환경 변화'],
    friendly: ['규칙적인 먹이', '안정적인 루틴', '관찰'],
    balanced: ['적절한 환경', '먹이', '휴식 등'],
  },
}

const activityText = {
  very_active: '매우 활발하고 에너지 넘치는',
  active: '활동적이고 활발한',
  moderate: '적당한 활동성을 가진',
  calm: '차분하고 조용한',
  very_calm: '매우 차분한',
}

const personalityText = {
  friendly: '친화적이고 사교적인',
  independent: '독립적이고 자기주도적인',
  playful: '장난기 많고 호기심 가득한',
  sensitive: '예민하고 섬세한',
  brave: '용감하고 대담한',
}

export const getActivitiesByPetType = (petType, activityType) => {
  const defaultKey = '강아지'
  return activityRecommendations[petType]?.[activityType] ?? activityRecommendations[defaultKey][activityType]
}

export const determinePetType = (answers) => {
  const { activity, personality, sociability, petType } = answers

  if (
    (activity === 'very_active' || activity === 'active') &&
    personality === 'friendly' &&
    sociability === 'very_social'
  ) {
    return {
      code: 'EFSP',
      title: '슈퍼 에너자이저',
      emoji: '⚡',
      description: '언제 어디서나 활력이 넘치고, 모든 사람과 친구가 되고 싶어하는 사교왕! 활동적이고 에너지 넘치는 반려동물입니다.',
      recommendations: ['운동량이 많은 장난감', '간식', '활동용품'],
      activities: getActivitiesByPetType(petType, 'energetic'),
    }
  }

  if ((activity === 'very_active' || activity === 'active') && personality === 'playful') {
    return {
      code: 'EPLO',
      title: '장난꾸러기 탐험가',
      emoji: '🎾',
      description: '호기심이 많고 장난치기를 좋아해요. 새로운 장난감과 게임에 금방 빠져들고, 집 안 곳곳을 탐험하는 걸 좋아합니다.',
      recommendations: ['인터랙티브 장난감', '퍼즐 장난감', '다양한 장난감'],
      activities: getActivitiesByPetType(petType, 'playful'),
    }
  }

  if (personality === 'independent' && (activity === 'calm' || activity === 'very_calm')) {
    return {
      code: 'ICQT',
      title: '고독한 철학자',
      emoji: '📚',
      description: '혼자만의 시간을 소중히 여기는 독립적인 성격. 조용한 환경을 선호하며, 자신만의 공간에서 편안하게 쉬는 걸 좋아합니다.',
      recommendations: ['편안한 침대', '은신처/하우스', '조용한 환경용품'],
      activities: getActivitiesByPetType(petType, 'independent'),
    }
  }

  if (personality === 'sensitive' && sociability === 'owner_only') {
    return {
      code: 'OSWT',
      title: '사랑스러운 수줍이',
      emoji: '💝',
      description: '예민하고 섬세한 성격으로 주인만을 믿고 따릅니다. 낯선 환경과 사람을 경계하지만, 신뢰하는 사람에게는 무한 애정을 보여줘요.',
      recommendations: ['안정감을 주는 침대', '부드러운 담요', '은신처'],
      activities: getActivitiesByPetType(petType, 'sensitive'),
    }
  }

  if (personality === 'brave' && (activity === 'active' || activity === 'moderate')) {
    return {
      code: 'BRAV',
      title: '용감한 리더',
      emoji: '🦁',
      description: '두려움 없이 새로운 것에 도전하는 대담한 성격! 자신감 넘치고 당당하며, 때로는 보호자 역할도 자처합니다.',
      recommendations: ['훈련용품', '다양한 활동용품', '튼튼한 장난감'],
      activities: getActivitiesByPetType(petType, 'brave'),
    }
  }

  if (personality === 'friendly' && sociability === 'selective') {
    return {
      code: 'FRSL',
      title: '선택적 친화형',
      emoji: '🤝',
      description: '친화적이지만 친구를 가려서 사귀는 신중한 타입. 친해지면 정말 다정하지만, 처음에는 관찰하며 거리를 둡니다.',
      recommendations: ['사회화 장난감', '간식', '편안한 공간'],
      activities: getActivitiesByPetType(petType, 'friendly'),
    }
  }

  return {
    code: 'BALN',
    title: '완벽한 균형형',
    emoji: '⚖️',
    description: '활동과 휴식, 사교와 독립의 균형을 완벽하게 맞추는 이상적인 성격! 상황에 따라 유연하게 대처하는 똑똑한 반려동물입니다.',
    recommendations: ['다양한 장난감', '간식', '편안한 침대'],
    activities: getActivitiesByPetType(petType, 'balanced'),
  }
}

export const generateDescription = (answers) =>
  `${answers.petName}는 ${activityText[answers.activity]} ${personalityText[answers.personality]} ${answers.petType}입니다.`

export const analyzePetCharacteristics = (answers) => {
  const petTypeInfo = determinePetType(answers)

  const tags = []
  if (answers.activity === 'very_active' || answers.activity === 'active') tags.push('활발함')
  if (answers.personality === 'friendly' || answers.sociability === 'very_social') tags.push('친화적')
  if (answers.personality === 'playful') tags.push('장난기 많음')
  if (answers.personality === 'sensitive') tags.push('예민함')
  if (answers.activity === 'calm' || answers.activity === 'very_calm') tags.push('조용함')
  if (answers.age === 0) tags.push('아기')
  else if (answers.age >= 12) tags.push('시니어')

  return {
    type: answers.petType,
    name: answers.petName,
    gender: answers.gender,
    age: answers.age,
    ageInMonths: answers.ageInMonths,
    breed: answers.breed,
    activity: answers.activity,
    personality: answers.personality,
    sociability: answers.sociability,
    petTypeInfo,
    tags,
    description: generateDescription(answers),
  }
}


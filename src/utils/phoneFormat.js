// 전화번호 하이픈 자동 삽입 (000-0000-0000 또는 000-000-0000)
export const formatPhoneNumber = (value) => {
  if (value == null) return ''

  const numbers = String(value).replace(/\D/g, '') // 숫자만 추출

  if (numbers.length < 4) return numbers
  if (numbers.length < 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  if (numbers.length < 11) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

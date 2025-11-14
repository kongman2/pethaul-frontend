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

  const selectedSet = toCategorySet(selectedCategories)
  const min = parseNumericFilter(priceMin)
  const max = parseNumericFilter(priceMax)

  return items.filter((item) => {
    if (selectedSet.size > 0) {
      const names = extractCategoryNames(getCategories(item))
      const hasMatch = names.some((name) => selectedSet.has(name))
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


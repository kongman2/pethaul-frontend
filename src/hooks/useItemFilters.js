import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterItems } from '../utils/itemFilters'

const defaultStatusLabels = {
  SELL: '판매중',
  SOLD_OUT: '품절',
}

export default function useItemFilters(items, options = {}) {
  const {
    enableStockToggle = true,
    inStockStatus = 'SELL',
    statusLabels = defaultStatusLabels,
    initialCategories = [],
  } = options

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.filter(Boolean) : []),
    [items]
  )

  const [selectedCats, setSelectedCats] = useState(initialCategories)

  // initialCategories가 변경되면 selectedCats도 업데이트
  useEffect(() => {
    const currentSorted = [...selectedCats].sort().join(',')
    const initialSorted = [...initialCategories].sort().join(',')
    if (currentSorted !== initialSorted) {
      setSelectedCats([...initialCategories]) // 새 배열로 설정하여 참조 변경
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sellStatus, setSellStatus] = useState('all')
  const [inStockOnly, setInStockOnly] = useState(false)

  const filteredList = useMemo(() => {
    const filterPayload = {
      selectedCategories: selectedCats,
      sellStatus: sellStatus === 'all' ? '' : sellStatus,
      priceMin,
      priceMax,
    }

    if (enableStockToggle) {
      filterPayload.inStockOnly = inStockOnly
      filterPayload.inStockStatus = inStockStatus
    }

    return filterItems(safeItems, filterPayload)
  }, [safeItems, selectedCats, sellStatus, priceMin, priceMax, inStockOnly, enableStockToggle, inStockStatus])

  const allCategories = useMemo(() => {
    const map = new Map()
    for (const it of safeItems) {
      for (const c of it?.Categories ?? []) {
        const name = c?.categoryName ?? c?.name ?? ''
        if (name && !map.has(name)) {
          map.set(name, { id: c?.id, name })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }, [safeItems])

  const handleResetFilters = useCallback(() => {
    setSelectedCats([])
    setSellStatus('all')
    setPriceMin('')
    setPriceMax('')
    setInStockOnly(false)
  }, [])

  const removeCategory = useCallback((name) => {
    setSelectedCats((prev) => prev.filter((n) => n !== name))
  }, [])

  const resetStatus = useCallback(() => {
    setSellStatus('all')
  }, [])

  const resetPriceFilters = useCallback(() => {
    setPriceMin('')
    setPriceMax('')
  }, [])

  const resetStockToggle = useCallback(() => {
    setInStockOnly(false)
  }, [])

  const activeFilterChips = useMemo(() => {
    const chips = []

    selectedCats.forEach((name) => {
      chips.push({
        key: `cat:${name}`,
        label: `#${name}`,
        onRemove: () => removeCategory(name),
      })
    })

    if (sellStatus && sellStatus !== 'all') {
      const label = statusLabels[sellStatus] ?? sellStatus
      chips.push({
        key: `status:${sellStatus}`,
        label: `상태 ${label}`,
        onRemove: resetStatus,
      })
    }

    if (priceMin || priceMax) {
      chips.push({
        key: `price:${priceMin}-${priceMax}`,
        label: `가격 ${priceMin || 0} ~ ${priceMax || '∞'}`,
        onRemove: resetPriceFilters,
      })
    }

    if (enableStockToggle && inStockOnly) {
      chips.push({
        key: 'stock:only',
        label: '재고 상품',
        onRemove: resetStockToggle,
      })
    }

    return chips
  }, [selectedCats, sellStatus, priceMin, priceMax, inStockOnly, removeCategory, resetStatus, resetPriceFilters, resetStockToggle, statusLabels, enableStockToggle])

  return {
    selectedCats,
    setSelectedCats,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    sellStatus,
    setSellStatus,
    inStockOnly,
    setInStockOnly,
    filteredList,
    allCategories,
    activeFilterChips,
    handleResetFilters,
    removeCategory,
    resetStatus,
    resetPriceFilters,
    resetStockToggle,
  }
}

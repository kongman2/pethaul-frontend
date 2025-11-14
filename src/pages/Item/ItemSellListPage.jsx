import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import ItemSellList from '../../components/item/ItemSellList'
import { fetchSortDataThunk } from '../../features/itemSlice'

import useAppBackground from '../../hooks/useAppBackground'

function ItemSellListPage() {
   useAppBackground('app-bg--ribbon')
   const [searchParams] = useSearchParams()
   const dispatch = useDispatch()
   const { loading, error, pagination, main } = useSelector((state) => state.item)

   const sellCategory = useMemo(() => searchParams.getAll('filter').filter(Boolean), [searchParams])
   const keywordParams = useMemo(() => {
      const combined = [
         ...searchParams.getAll('keyword'),
         ...searchParams.getAll('searchTerm'),
      ]
      const single = searchParams.get('searchTerm')
      if (single) combined.push(single)
      return combined.map((v) => v?.trim()).filter(Boolean)
   }, [searchParams])
   const sortKey = searchParams.get('sort')?.trim() || ''

   const headerTitle = useMemo(() => {
      if (sellCategory.length > 0) return sellCategory.join(' / ')
      if (keywordParams.length > 0) return keywordParams.join(' / ')
      if (sortKey) return sortKey.toUpperCase()
      return '상품 목록'
   }, [sellCategory, keywordParams, sortKey])

   useEffect(() => {
      if (sortKey) {
         dispatch(fetchSortDataThunk(50))
      }
   }, [dispatch, sortKey])

   const listItems = sortKey ? main?.[sortKey] ?? [] : undefined
   const listPagination = sortKey ? null : pagination

   return (
      <div className="container">
         <ItemSellList
            title={headerTitle}
            searchTerm={keywordParams}
            sellCategory={sellCategory}
            items={listItems}
            loading={loading}
            error={error}
            pagination={listPagination}
            autoFetch={!sortKey}
         />
      </div>
   )
}

export default ItemSellListPage

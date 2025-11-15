import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Icon } from '@iconify/react'
import { getAllUsers } from '../../../api/authApi'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'
import { SectionCard, Spinner, AlertModal, Input, Pagination } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { buildImageUrl, getProfileImage } from '../../../utils/imageUtils'
import './UserPanel.scss'

function UserPanel() {
  const dispatch = useDispatch()
  const { alertModal } = useModalHelpers()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const loadUsers = async (pageNum = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllUsers({ page: pageNum, limit: 20, searchTerm: search })
      const data = response?.data || response
      setUsers(data.users || [])
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 })
    } catch (err) {
      setError(err?.response?.data?.message || '사용자 목록을 불러오는데 실패했습니다.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(page, searchTerm)
  }, [page, searchTerm])

  const handleSearch = () => {
    setSearchTerm(searchInput.trim())
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AdminPanelLayout title="회원 관리">
      <div className="user-panel">
        {/* 검색 */}
        <div className="user-panel__search mb-4">
          <div className="d-flex gap-2">
            <Input
              placeholder="사용자 ID, 이름, 이메일로 검색"
              value={searchInput}
              onChange={setSearchInput}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              rightButton={{
                text: '검색',
                onClick: handleSearch,
                variant: 'outline',
                size: 'sm',
              }}
            />
          </div>
        </div>

        {/* 사용자 목록 */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner text="사용자 목록을 불러오는 중..." />
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>등록된 사용자가 없습니다.</p>
          </div>
        ) : (
          <>
            <SectionCard bodyClassName="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>프로필</th>
                      <th>사용자 ID</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>전화번호</th>
                      <th>권한</th>
                      <th>로그인 방식</th>
                      <th>가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const avatar = user.avatar ? buildImageUrl(user.avatar) : getProfileImage()
                      return (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <img
                              src={avatar}
                              alt={user.name}
                              className="user-panel__avatar"
                              onError={(e) => {
                                e.currentTarget.src = getProfileImage()
                              }}
                            />
                          </td>
                          <td>{user.userId}</td>
                          <td>{user.name}</td>
                          <td>{user.email || '-'}</td>
                          <td>{user.phoneNumber || '-'}</td>
                          <td>
                            <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {user.provider === 'google' ? '구글' : '로컬'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* 통계 */}
            <div className="user-panel__stats mt-4">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h5 className="card-title">전체 사용자</h5>
                      <p className="card-text h3">{pagination.total}</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h5 className="card-title">관리자</h5>
                      <p className="card-text h3">
                        {users.filter((u) => u.role === 'ADMIN').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <h5 className="card-title">일반 사용자</h5>
                      <p className="card-text h3">
                        {users.filter((u) => u.role === 'USER').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </AdminPanelLayout>
  )
}

export default UserPanel


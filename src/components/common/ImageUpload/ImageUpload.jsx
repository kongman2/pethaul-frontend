import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Icon } from '@iconify/react'
import { Button, Spinner } from '../index'
import './ImageUpload.scss'

/**
 * ImageUpload 공통 컴포넌트
 * 
 * @param {string} label - 라벨 텍스트
 * @param {boolean} required - 필수 여부
 * @param {boolean} multiple - 다중 업로드 여부
 * @param {number} maxFiles - 최대 파일 개수 (multiple일 때)
 * @param {Array<string>} previewUrls - 미리보기 이미지 URL 배열
 * @param {Function} onChange - 파일 선택 시 콜백 (files) => void
 * @param {Function} onRemove - 이미지 제거 시 콜백 (index) => void (optional)
 * @param {boolean} uploading - 업로드 중 상태
 * @param {string} uploadingText - 업로드 중 텍스트
 * @param {string} error - 에러 메시지
 * @param {string} hint - 안내 메시지
 * @param {string} buttonText - 버튼 텍스트
 * @param {string} className - 추가 클래스
 * @param {boolean} disabled - 비활성화 여부
 */
const ImageUpload = ({
  label,
  required = false,
  multiple = false,
  maxFiles = 5,
  previewUrls = [],
  onChange,
  onRemove,
  uploading = false,
  uploadingText = '업로드 중...',
  error = '',
  hint = '',
  buttonText,
  className = '',
  disabled = false,
  id,
  controlsAlign = 'start',
  previewAlign = 'start',
}) => {
  const fileInputRef = useRef(null)

  const handleButtonClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e) => {
    if (onChange) {
      const files = Array.from(e.target.files || [])
      onChange(files)
    }
    e.target.value = ''
  }

  const defaultButtonText = multiple 
    ? (previewUrls.length > 0 ? '이미지 추가' : '이미지 선택')
    : (previewUrls.length > 0 ? '이미지 변경' : '이미지 선택')

  return (
    <div className={`image-upload ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label fw-semibold">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          {multiple && maxFiles && (
            <small className="text-muted ms-2">(최대 {maxFiles}개)</small>
          )}
        </label>
      )}

      {/* 미리보기 영역 */}
      {previewUrls.length > 0 && (
        <div
          className={[
            'image-upload__preview-grid',
            'mb-3',
            'd-flex',
            previewAlign === 'center' ? 'justify-content-center' : 'justify-content-start',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {previewUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="image-upload__preview-item">
              <img src={url} alt={`preview-${index + 1}`} />
              {onRemove && !disabled && (
                <button
                  type="button"
                  className="image-upload__preview-remove"
                  onClick={() => onRemove(index)}
                  aria-label="이미지 제거"
                >
                  <Icon icon="lucide:x" width="16" height="16" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 업로드 중 */}
      {uploading && (
        <div className="mb-3">
          <Spinner size="sm" text={uploadingText} />
        </div>
      )}

      {/* 파일 선택 버튼 */}
      <div
        className={[
          'd-flex',
          'flex-column',
          'flex-sm-row',
          'gap-2',
          'mb-2',
          controlsAlign === 'center' ? 'align-items-center justify-content-center' : 'align-items-start',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="d-none"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className="image-upload__upload-button"
        >
          <Icon icon="lucide:upload" width={18} height={18} className="me-2" />
          {buttonText || defaultButtonText}
        </Button>
        {multiple && (
          <small
            className={[
              'text-muted',
              controlsAlign === 'center' ? 'align-self-center text-center' : 'align-self-start',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {previewUrls.length}/{maxFiles} 개 선택됨
          </small>
        )}
      </div>

      {/* 안내 메시지 */}
      {hint && (
        <small className="text-muted d-block mb-2">{hint}</small>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="alert alert-warning mt-2 mb-0" role="alert">
          <small>{error}</small>
        </div>
      )}
    </div>
  )
}

ImageUpload.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  previewUrls: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  uploading: PropTypes.bool,
  uploadingText: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  controlsAlign: PropTypes.oneOf(['start', 'center']),
  previewAlign: PropTypes.oneOf(['start', 'center']),
}

ImageUpload.defaultProps = {
  required: false,
  multiple: false,
  maxFiles: 5,
  previewUrls: [],
  uploading: false,
  uploadingText: '업로드 중...',
  error: '',
  hint: '',
  buttonText: undefined,
  className: '',
  disabled: false,
  id: undefined,
  controlsAlign: 'start',
  previewAlign: 'start',
}

export default ImageUpload


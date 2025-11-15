import React, { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import PropTypes from 'prop-types'

import AlertModal from '../Modal/AlertModal'
import { useModalHelpers } from '../../../hooks/useModalHelpers'

import './RichTextEditor.scss'

/**
 * RichTextEditor 공통 컴포넌트 (Tiptap 기반)
 * 
 * @param {string} label - 라벨 텍스트
 * @param {string} value - HTML 콘텐츠
 * @param {Function} onChange - 변경 이벤트 핸들러 (html) => void
 * @param {boolean} required - 필수 여부
 * @param {string} placeholder - placeholder
 * @param {string} error - 에러 메시지
 * @param {string} hint - 안내 메시지
 * @param {Function} onImageUpload - 이미지 업로드 핸들러 (file) => Promise<url>
 * @param {string} className - 추가 클래스
 * @param {string} id - input id
 */
const RichTextEditor = ({
  label,
  value = '',
  onChange,
  required = false,
  placeholder = '내용을 입력하세요...',
  error = '',
  hint = '',
  onImageUpload,
  className = '',
  id,
}) => {
  const { alert, alertModal } = useModalHelpers()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
    editorProps: {
      attributes: {
        class: 'pethaul-editor-content',
      },
    },
  })

  // 이미지 추가
  const addImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        if (onImageUpload) {
          // 커스텀 업로드 핸들러 사용
          const url = await onImageUpload(file)
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        } else {
          // 로컬 미리보기 (base64)
          const reader = new FileReader()
          reader.onload = (event) => {
            const url = event.target?.result
            if (url && editor) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        alert('이미지 업로드에 실패했습니다.', '오류', 'danger')
      }
    }

    input.click()
  }, [editor, onImageUpload, alert])

  // 링크 추가
  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('링크 URL을 입력하세요:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // 외부에서 value가 변경될 때 에디터 내용 업데이트 (수정 모드 등)
  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    // value가 변경되었고, 현재 에디터 내용과 다를 때만 업데이트
    if (value !== undefined && currentHtml !== value) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`rich-text-editor ${className}`} id={id}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <div className={`editor-wrapper ${error ? 'has-error' : ''}`}>
        {/* 툴바 */}
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="굵게"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="기울임"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              title="취소선"
            >
              <s>S</s>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              title="제목 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              title="제목 3"
            >
              H3
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              title="글머리 기호"
            >
              • 목록
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
              title="번호 매기기"
            >
              1. 목록
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group">
            <button
              type="button"
              onClick={setLink}
              className={editor.isActive('link') ? 'is-active' : ''}
              title="링크"
            >
              링크
            </button>
            <button
              type="button"
              onClick={addImage}
              title="이미지"
            >
              이미지
            </button>
          </div>
        </div>

        {/* 에디터 영역 */}
        <EditorContent editor={editor} />
      </div>

      {hint && !error && (
        <small className="form-text text-muted d-block mt-1">{hint}</small>
      )}
      {error && (
        <div className="invalid-feedback d-block mt-1">{error}</div>
      )}
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </div>
  )
}

RichTextEditor.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  onImageUpload: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
}

export default RichTextEditor


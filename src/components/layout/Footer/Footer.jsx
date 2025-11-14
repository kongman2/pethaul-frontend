import { Icon } from '@iconify/react'

function Footer() {
   return (
      <footer className="bg-light border-top py-4" style={{ backgroundColor: '#FFFDE9', borderTop: '1px solid #D8D8D8' }}>
         <div className="container">
            {/* 1번째 줄: 상단 영역 */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pb-3 border-bottom">
               {/* 좌측: 링크들 */}
               <div className="d-flex flex-wrap gap-3" style={{fontSize: '13px'}}>
                  <a href="/" className="text-decoration-none text-dark">
                     이용약관
                  </a>
                  <a href="/" className="text-decoration-none text-dark">
                     개인정보처리방침
                  </a>
                  <a href="/" className="text-decoration-none text-dark">
                     ABOUT US
                  </a>
                  <a href="/" className="text-decoration-none text-dark">
                     공지사항
                  </a>
               </div>

               {/* 우측: SNS 아이콘 */}
               <div className="d-flex gap-2">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-dark">
                     <Icon icon="streamline-pixel:logo-social-media-facebook-circle" width={30} height={30} />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-dark">
                    <Icon icon="streamline-pixel:logo-social-media-youtube-circle" width={30} height={30} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-dark">
                     <Icon icon="streamline-pixel:logo-social-media-instagram" width={30} height={30} />
                  </a>
               </div>
            </div>

            {/* 2번째 줄: 하단 영역 */}
            <div className="pt-3">
               <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between flex-wrap" style={{rowGap: '0.5rem'}}>
                  <div>
                     <p className='galindo mb-1'>
                        PETHAUL<span style={{fontSize: '13px'}}>(주)</span>
                     </p>
                     <button className="btn btn-link p-0 text-start" style={{fontSize:'11px'}}>
                        사업자정보 <Icon icon="pixel:angle-down" width={13} height={13} />
                     </button>
                  </div>
               </div>

               {/* CopyRight */}
               <p className="mt-2 mb-0" style={{fontSize: '11px'}}>
                  © 2024 SHOPMAX. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   )
}

export default Footer

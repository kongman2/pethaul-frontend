// Render.com에서 SPA 라우팅을 처리하기 위한 간단한 서버
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5173

const distPath = join(__dirname, 'dist')
const indexHtmlPath = join(distPath, 'index.html')

// dist 폴더 존재 확인
if (!existsSync(distPath)) {
   console.error('❌ dist 폴더를 찾을 수 없습니다. 빌드를 먼저 실행하세요.')
   process.exit(1)
}

if (!existsSync(indexHtmlPath)) {
   console.error('❌ index.html을 찾을 수 없습니다. 빌드를 먼저 실행하세요.')
   process.exit(1)
}

console.log('✅ dist 폴더 확인 완료:', distPath)

// 정적 파일 서빙
app.use(express.static(distPath, {
   maxAge: '1d',
   etag: true
}))

// 모든 경로를 index.html로 리다이렉트 (SPA 라우팅)
app.get('*', (req, res) => {
   try {
      console.log('📄 요청 경로:', req.path)
      const html = readFileSync(indexHtmlPath, 'utf-8')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(html)
   } catch (error) {
      console.error('❌ index.html 로드 실패:', error.message)
      res.status(500).send(`
         <html>
            <body>
               <h1>서버 오류</h1>
               <p>index.html을 로드할 수 없습니다.</p>
               <p>오류: ${error.message}</p>
            </body>
         </html>
      `)
   }
})

app.listen(PORT, () => {
   console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`)
   console.log(`📁 정적 파일 경로: ${distPath}`)
   console.log(`🌐 서버 URL: http://localhost:${PORT}`)
})


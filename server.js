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

// 정적 파일 서빙 (assets, images 등)
// express.static은 파일을 찾지 못하면 자동으로 next()를 호출
app.use(express.static(distPath, {
   maxAge: '1d',
   etag: true,
   index: false // index.html 자동 서빙 비활성화
}))

// SPA 라우팅: 정적 파일이 아닌 모든 경로는 index.html 반환
app.get('*', (req, res) => {
   // 정적 파일 확장자가 있는 요청은 이미 express.static이 처리했거나 404를 반환했음
   // 여기서는 라우트 경로만 처리
   try {
      console.log('📄 SPA 라우팅 요청:', req.path)
      let html = readFileSync(indexHtmlPath, 'utf-8')
      
      // 런타임 환경 변수를 HTML에 주입
      const envVars = {
         VITE_APP_API_URL: process.env.VITE_APP_API_URL || 'https://pethaul-api.onrender.com',
         VITE_APP_AUTH_KEY: process.env.VITE_APP_AUTH_KEY || ''
      }
      
      // 환경 변수 스크립트 (가장 먼저 실행되도록)
      const envScript = `<script>window.__ENV__ = ${JSON.stringify(envVars)};</script>`
      
      // </head> 태그 앞에 삽입 (없으면 <head> 뒤에, 그것도 없으면 <body> 앞에)
      if (html.includes('</head>')) {
         html = html.replace('</head>', `${envScript}</head>`)
      } else if (html.includes('<head>')) {
         html = html.replace('<head>', `<head>${envScript}`)
      } else if (html.includes('<body>')) {
         html = html.replace('<body>', `${envScript}<body>`)
      } else {
         // 최후의 수단: 맨 앞에 삽입
         html = envScript + html
      }
      
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


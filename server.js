// Render.com에서 SPA 라우팅을 처리하기 위한 간단한 서버
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5173

// 정적 파일 서빙
app.use(express.static(join(__dirname, 'dist')))

// 모든 경로를 index.html로 리다이렉트 (SPA 라우팅)
app.get('*', (req, res) => {
   try {
      const html = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8')
      res.send(html)
   } catch (error) {
      res.status(500).send('Error loading index.html')
   }
})

app.listen(PORT, () => {
   console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`)
})


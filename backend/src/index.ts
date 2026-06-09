import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import classRoutes from './routes/classes'
import attendanceRoutes from './routes/attendance'
import contentRoutes from './routes/content'
import gradeRoutes from './routes/grades'
import dashboardRoutes from './routes/dashboard'
import studentRoutes from './routes/student'
import analyticsRoutes from './routes/analytics'
import gamificationRoutes from './routes/gamification'
import adminRoutes from './routes/admin'
import alertRoutes from './routes/alerts'
import journalRoutes from './routes/journals'
import reportRoutes from './routes/reports'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/grades', gradeRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/journals', journalRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Eduva API running on http://localhost:${PORT}`)
})

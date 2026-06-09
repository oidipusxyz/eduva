import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  teacherId?: string
  teacherRole?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' }); return
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role?: string }
    req.teacherId = payload.id
    req.teacherRole = payload.role ?? 'teacher'
    next()
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' }); return
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { id: string; role?: string }
    if (payload.role !== 'admin') {
      res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengakses ini.' }); return
    }
    req.teacherId = payload.id
    req.teacherRole = 'admin'
    next()
  } catch {
    res.status(401).json({ message: 'Token tidak valid' })
  }
}

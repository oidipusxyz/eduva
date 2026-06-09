export interface Teacher {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: string
  created_at: string
  student_count?: number
}

export interface Student {
  id: string
  class_id: string
  full_name: string
  username: string
  created_at: string
}

export interface AttendanceSession {
  id: string
  class_id: string
  pin: string
  expires_at: string
  created_at: string
  present_count?: number
  total_count?: number
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  status: 'present' | 'absent' | 'late' | 'excused'
  created_at: string
  student?: Student
}

export interface Content {
  id: string
  class_id: string
  type: 'material' | 'assignment'
  title: string
  file_url?: string
  link_url?: string
  deadline?: string
  created_at: string
}

export interface Grade {
  id: string
  student_id: string
  class_id: string
  subject: string
  score: number
  created_at: string
  student?: Student
}

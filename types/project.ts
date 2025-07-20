export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  address?: string
  phone_number?: string
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
  address?: string
  phone_number?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  address?: string
  phone_number?: string
}
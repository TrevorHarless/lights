export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  address?: string
  phone_number?: string
  image_url?: string
  image_path?: string
  image_url_expires_at?: string  // When current URL expires
  image_url_cached_at?: string   // When URL was last cached
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
  address?: string
  phone_number?: string
  image_url?: string
  image_path?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  address?: string
  phone_number?: string
  image_url?: string
  image_path?: string
}
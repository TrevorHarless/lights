export interface LightString {
  id: string
  start: { x: number; y: number }
  end: { x: number; y: number }
  assetId: string
  lightSpacing?: number
}

export interface SingleLight {
  id: string
  position: { x: number; y: number }
  assetId: string
  timestamp: number
}

export interface Decor {
  id: string
  type: string
  center: { x: number; y: number }
  radius: number
  assetId: string
  lightSpacing: number
  createdAt: number
}

export interface ReferenceScale {
  referenceLine?: {
    start: { x: number; y: number }
    end: { x: number; y: number }
  }
  referenceLength?: number
}

export interface MeasurementLine {
  id: string
  start: { x: number; y: number }
  end: { x: number; y: number }
  lengthInFeet: number
  label: string
}

export interface LightData {
  lightStrings: LightString[]
  singleLights: SingleLight[]
  decor: Decor[]
  referenceScale?: ReferenceScale
  measurementLines?: MeasurementLine[]
  lastSaved: string
  version: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  address?: string
  phone_number?: string
  email?: string
  image_url?: string
  image_path?: string
  image_url_expires_at?: string  // When current URL expires
  image_url_cached_at?: string   // When URL was last cached
  light_data?: LightData
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
  address?: string
  phone_number?: string
  email?: string
  image_url?: string
  image_path?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  address?: string
  phone_number?: string
  email?: string
  image_url?: string
  image_path?: string
}
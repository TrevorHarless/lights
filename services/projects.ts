import { supabase } from '@/lib/supabase'
import { Project, CreateProjectData } from '@/types/project'
import { imageUploadService } from './imageUpload'

export const projectsService = {
  async getProjects(): Promise<{ data: Project[] | null; error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createProject(projectData: CreateProjectData): Promise<{ data: Project | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: projectData.name,
          description: projectData.description || null,
          address: projectData.address || null,
          phone_number: projectData.phone_number || null,
          image_url: projectData.image_url || null,
          image_path: projectData.image_path || null,
        }
      ])
      .select()
      .single()

    return { data, error }
  },

  async deleteProject(projectId: string): Promise<{ error: any }> {
    // First, get the project to retrieve the image_path
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('image_path')
      .eq('id', projectId)
      .single()

    if (fetchError) {
      return { error: fetchError }
    }

    // Delete the project from database
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      return { error: deleteError }
    }

    // Delete associated image from storage if it exists
    if (project?.image_path) {
      await imageUploadService.deleteImage(project.image_path)
    }

    return { error: null }
  },

  async updateProject(projectId: string, updates: Partial<CreateProjectData>): Promise<{ data: Project | null; error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    return { data, error }
  }
}
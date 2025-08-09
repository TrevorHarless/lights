import { supabase } from '~/lib/supabase';
import { CreateProjectData, Project } from '~/types/project';
import { imageUploadService } from './imageUpload';

export const projectsService = {
  async getProjects(): Promise<{ data: Project[] | null; error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return { data, error }
    }

    // Refresh signed URLs for projects with images
    const projectsWithRefreshedUrls = await Promise.all(
      data.map(async (project) => {
        if (project.image_path) {
          const { url } = await imageUploadService.getSignedUrl(project.image_path)
          return {
            ...project,
            image_url: url || project.image_url
          }
        }
        return project
      })
    )

    return { data: projectsWithRefreshedUrls, error: null }
  },

  async getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      return { data, error }
    }

    // Refresh signed URL if project has an image
    if (data.image_path) {
      const { url } = await imageUploadService.getSignedUrl(data.image_path)
      data.image_url = url || data.image_url
    }

    return { data, error: null }
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
  },

  async deleteAllProjects(): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'User not authenticated' } }
    }

    // First, get all projects to retrieve their image_paths
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('image_path')
      .eq('user_id', user.id)

    if (fetchError) {
      return { error: fetchError }
    }

    // Delete all projects from database
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      return { error: deleteError }
    }

    // Delete associated images from storage
    if (projects && projects.length > 0) {
      await Promise.all(
        projects
          .filter(project => project.image_path)
          .map(project => imageUploadService.deleteImage(project.image_path!))
      )
    }

    return { error: null }
  }
}
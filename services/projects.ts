import { supabase } from '~/lib/supabase';
import { CreateProjectData, Project } from '~/types/project';
import { imageUploadService } from './imageUpload';
import { localStorageService } from './localStorage';

export const projectsService = {
  async getProjects(): Promise<{ data: Project[] | null; error: any }> {
    // This method should only be called during sync operations
    // Regular app usage should use localStorageService.getProjects()
    
    console.log('🌐 Supabase: Fetching projects from server');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return { data, error }
    }

    // Only refresh URLs that are expired or missing using smart caching
    const projectsWithSmartUrls = await Promise.all(
      data.map(async (project) => {
        if (project.image_path) {
          // First try to get from local storage cache
          const localProject = await localStorageService.getProject(project.id);
          if (localProject) {
            const cached = await localStorageService.getCachedImageUrl(localProject);
            if (cached) {
              return { ...project, image_url: cached };
            }
          }
          
          // Only generate new URL if cache is expired/missing
          const { url } = await imageUploadService.getSignedUrl(project.image_path);
          if (url) {
            await localStorageService.cacheImageUrl(project.id, url);
            return { 
              ...project, 
              image_url: url,
              image_url_expires_at: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
              image_url_cached_at: new Date().toISOString()
            };
          }
        }
        return project;
      })
    )

    return { data: projectsWithSmartUrls, error: null }
  },

  async getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
    // This method should primarily be used during sync operations
    // Regular app usage should use localStorageService.getProject()
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      return { data, error }
    }

    // Use smart caching for single project image URL
    if (data.image_path) {
      // Try to get cached URL from local storage
      const localProject = await localStorageService.getProject(data.id);
      if (localProject) {
        const cached = await localStorageService.getCachedImageUrl(localProject);
        if (cached) {
          data.image_url = cached;
          return { data, error: null };
        }
      }
      
      // Generate new URL and cache it
      const { url } = await imageUploadService.getSignedUrl(data.image_path);
      if (url) {
        await localStorageService.cacheImageUrl(data.id, url);
        data.image_url = url;
        data.image_url_expires_at = new Date(Date.now() + 50 * 60 * 1000).toISOString();
        data.image_url_cached_at = new Date().toISOString();
      }
    }

    return { data, error: null }
  },

  async createProject(projectData: CreateProjectData): Promise<{ data: Project | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    console.log('🌐 Supabase: Creating project on server -', projectData.name);
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
    console.log('🌐 Supabase: Deleting project from server -', projectId);
    
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
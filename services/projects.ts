import { supabase } from '@/lib/supabase'
import { Project, CreateProjectData } from '@/types/project'

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
        }
      ])
      .select()
      .single()

    return { data, error }
  },

  async deleteProject(projectId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    return { error }
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
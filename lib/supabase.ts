import { createClient, SupabaseClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

const baseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Logging wrapper for Supabase client
class LoggedSupabaseClient {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  // Database operations logging
  from(table: string) {
    console.log(`🗄️  SUPABASE DB: Accessing table '${table}'`)
    
    const originalQuery = this.client.from(table)
    
    // Wrap common query methods with logging
    const wrappedQuery = {
      ...originalQuery,
      select: (...args: any[]) => {
        console.log(`🗄️  SUPABASE DB: SELECT from '${table}'`, args.length > 0 ? `columns: ${args[0]}` : 'all columns')
        return originalQuery.select(...args)
      },
      insert: (data: any) => {
        console.log(`🗄️  SUPABASE DB: INSERT into '${table}'`, typeof data === 'object' ? `records: ${Array.isArray(data) ? data.length : 1}` : '')
        return originalQuery.insert(data)
      },
      update: (data: any) => {
        console.log(`🗄️  SUPABASE DB: UPDATE in '${table}'`, data)
        return originalQuery.update(data)
      },
      delete: () => {
        console.log(`🗄️  SUPABASE DB: DELETE from '${table}'`)
        return originalQuery.delete()
      },
      upsert: (data: any) => {
        console.log(`🗄️  SUPABASE DB: UPSERT into '${table}'`, typeof data === 'object' ? `records: ${Array.isArray(data) ? data.length : 1}` : '')
        return originalQuery.upsert(data)
      }
    }
    
    return wrappedQuery
  }

  // Storage operations logging
  get storage() {
    const originalStorage = this.client.storage
    
    return {
      ...originalStorage,
      from: (bucket: string) => {
        console.log(`📦 SUPABASE STORAGE: Accessing bucket '${bucket}'`)
        
        const originalBucket = originalStorage.from(bucket)
        
        return {
          ...originalBucket,
          upload: async (path: string, file: any, options?: any) => {
            console.log(`📦 SUPABASE STORAGE: UPLOAD to '${bucket}/${path}'`, options ? `options: ${JSON.stringify(options)}` : '')
            const startTime = Date.now()
            try {
              const result = await originalBucket.upload(path, file, options)
              const duration = Date.now() - startTime
              console.log(`📦 SUPABASE STORAGE: UPLOAD completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
              return result
            } catch (error) {
              const duration = Date.now() - startTime
              console.error(`📦 SUPABASE STORAGE: UPLOAD failed in ${duration}ms`, error)
              throw error
            }
          },
          download: async (path: string) => {
            console.log(`📦 SUPABASE STORAGE: DOWNLOAD from '${bucket}/${path}'`)
            const startTime = Date.now()
            try {
              const result = await originalBucket.download(path)
              const duration = Date.now() - startTime
              console.log(`📦 SUPABASE STORAGE: DOWNLOAD completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
              return result
            } catch (error) {
              const duration = Date.now() - startTime
              console.error(`📦 SUPABASE STORAGE: DOWNLOAD failed in ${duration}ms`, error)
              throw error
            }
          },
          remove: async (paths: string[]) => {
            console.log(`📦 SUPABASE STORAGE: REMOVE from '${bucket}'`, `paths: [${paths.join(', ')}]`)
            const startTime = Date.now()
            try {
              const result = await originalBucket.remove(paths)
              const duration = Date.now() - startTime
              console.log(`📦 SUPABASE STORAGE: REMOVE completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
              return result
            } catch (error) {
              const duration = Date.now() - startTime
              console.error(`📦 SUPABASE STORAGE: REMOVE failed in ${duration}ms`, error)
              throw error
            }
          },
          createSignedUrl: async (path: string, expiresIn: number) => {
            console.log(`📦 SUPABASE STORAGE: CREATE_SIGNED_URL for '${bucket}/${path}'`, `expires: ${expiresIn}s`)
            const startTime = Date.now()
            try {
              const result = await originalBucket.createSignedUrl(path, expiresIn)
              const duration = Date.now() - startTime
              console.log(`📦 SUPABASE STORAGE: CREATE_SIGNED_URL completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
              return result
            } catch (error) {
              const duration = Date.now() - startTime
              console.error(`📦 SUPABASE STORAGE: CREATE_SIGNED_URL failed in ${duration}ms`, error)
              throw error
            }
          },
          createSignedUrls: async (paths: string[], expiresIn: number) => {
            console.log(`📦 SUPABASE STORAGE: CREATE_SIGNED_URLS for '${bucket}'`, `paths: [${paths.join(', ')}], expires: ${expiresIn}s`)
            const startTime = Date.now()
            try {
              const result = await originalBucket.createSignedUrls(paths, expiresIn)
              const duration = Date.now() - startTime
              console.log(`📦 SUPABASE STORAGE: CREATE_SIGNED_URLS completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
              return result
            } catch (error) {
              const duration = Date.now() - startTime
              console.error(`📦 SUPABASE STORAGE: CREATE_SIGNED_URLS failed in ${duration}ms`, error)
              throw error
            }
          }
        }
      }
    }
  }

  // Auth operations logging
  get auth() {
    const originalAuth = this.client.auth
    
    return {
      ...originalAuth,
      signInWithPassword: async (credentials: any) => {
        console.log(`🔐 SUPABASE AUTH: SIGN_IN_WITH_PASSWORD`, `email: ${credentials.email}`)
        const startTime = Date.now()
        try {
          const result = await originalAuth.signInWithPassword(credentials)
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: SIGN_IN_WITH_PASSWORD completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: SIGN_IN_WITH_PASSWORD failed in ${duration}ms`, error)
          throw error
        }
      },
      signUp: async (credentials: any) => {
        console.log(`🔐 SUPABASE AUTH: SIGN_UP`, `email: ${credentials.email}`)
        const startTime = Date.now()
        try {
          const result = await originalAuth.signUp(credentials)
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: SIGN_UP completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: SIGN_UP failed in ${duration}ms`, error)
          throw error
        }
      },
      signOut: async () => {
        console.log(`🔐 SUPABASE AUTH: SIGN_OUT`)
        const startTime = Date.now()
        try {
          const result = await originalAuth.signOut()
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: SIGN_OUT completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: SIGN_OUT failed in ${duration}ms`, error)
          throw error
        }
      },
      getUser: async () => {
        console.log(`🔐 SUPABASE AUTH: GET_USER`)
        const startTime = Date.now()
        try {
          const result = await originalAuth.getUser()
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: GET_USER completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: GET_USER failed in ${duration}ms`, error)
          throw error
        }
      },
      getSession: async () => {
        console.log(`🔐 SUPABASE AUTH: GET_SESSION`)
        const startTime = Date.now()
        try {
          const result = await originalAuth.getSession()
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: GET_SESSION completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: GET_SESSION failed in ${duration}ms`, error)
          throw error
        }
      },
      updateUser: async (attributes: any) => {
        console.log(`🔐 SUPABASE AUTH: UPDATE_USER`, attributes)
        const startTime = Date.now()
        try {
          const result = await originalAuth.updateUser(attributes)
          const duration = Date.now() - startTime
          console.log(`🔐 SUPABASE AUTH: UPDATE_USER completed in ${duration}ms`, result.error ? `❌ Error: ${result.error.message}` : '✅ Success')
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`🔐 SUPABASE AUTH: UPDATE_USER failed in ${duration}ms`, error)
          throw error
        }
      },
      onAuthStateChange: (callback: any) => {
        console.log(`🔐 SUPABASE AUTH: ON_AUTH_STATE_CHANGE - Setting up listener`)
        return originalAuth.onAuthStateChange((event, session) => {
          console.log(`🔐 SUPABASE AUTH: AUTH_STATE_CHANGE event: ${event}`, session ? `user: ${session.user?.email}` : 'no session')
          callback(event, session)
        })
      }
    }
  }

  // Pass through other properties
  get rpc() {
    return this.client.rpc
  }

  get channel() {
    return this.client.channel
  }

  get functions() {
    return this.client.functions
  }

  get realtime() {
    return this.client.realtime
  }
}

export const supabase = new LoggedSupabaseClient(baseClient)
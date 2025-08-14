import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { supabase } from '~/lib/supabase'

export interface ImageUploadResult {
  success: boolean
  imageUrl?: string
  imagePath?: string
  error?: string
}

export const imageUploadService = {
  // Request permissions for media library and image picker
  async requestPermissions(): Promise<boolean> {
    const [mediaLibraryResult, imagePickerResult] = await Promise.all([
      MediaLibrary.requestPermissionsAsync(),
      ImagePicker.requestMediaLibraryPermissionsAsync()
    ])
    return mediaLibraryResult.status === 'granted' && imagePickerResult.status === 'granted'
  },

  // Pick image from library
  async pickImage(): Promise<ImagePicker.ImagePickerResult | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) {
      return null
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    })

    return result
  },

  // Take photo with camera
  async takePhoto(): Promise<ImagePicker.ImagePickerResult | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      return null
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    })

    return result
  },

  // Upload image to Supabase Storage
  async uploadImage(
    imageUri: string,
    userId: string
  ): Promise<ImageUploadResult> {
    try {
      // Read the image file as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Generate unique filename
      const timestamp = Date.now()
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${timestamp}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Convert base64 to ArrayBuffer
      const arrayBuffer = decode(base64)

      console.log('Uploading to path:', filePath, 'Content type:', `image/${fileExt}`);

      // Upload to Supabase Storage
      const { data: uploadData, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        return {
          success: false,
          error: error.message,
        }
      }

      console.log('Upload successful:', uploadData);

      // Get signed URL (valid for 1 year)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('project-images')
        .createSignedUrl(filePath, 31536000) // 1 year in seconds

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        return {
          success: false,
          error: urlError.message,
        }
      }

      console.log('Generated signed URL:', urlData.signedUrl);

      return {
        success: true,
        imageUrl: urlData.signedUrl,
        imagePath: filePath,
      }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  // Delete image from storage
  async deleteImage(imagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from('project-images')
        .remove([imagePath])

      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  // Get signed URL for existing image
  async getSignedUrl(imagePath: string): Promise<{ url?: string; error?: string }> {
    try {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('project-images')
        .createSignedUrl(imagePath, 31536000) // 1 year in seconds

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        return { error: urlError.message }
      }

      return { url: urlData.signedUrl }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Show image picker options
  showImageOptions(): Promise<'camera' | 'library' | null> {
    return new Promise((resolve) => {
      // This would typically show an action sheet
      // For now, we'll default to library
      resolve('library')
    })
  },
}
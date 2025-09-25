import { createClient } from '@supabase/supabase-js'
import { MediaAdapter, MediaUploadOptions, MediaUploadResult, MediaDeleteOptions, MediaTransformOptions, MediaProvider } from './types'

export class SupabaseMediaAdapter implements MediaAdapter {
  name = MediaProvider.SUPABASE
  private client
  private bucket: string

  constructor(config: {
    url: string
    serviceRoleKey: string
    bucket: string
  }) {
    this.client = createClient(config.url, config.serviceRoleKey)
    this.bucket = config.bucket
  }

  async upload(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const key = `${Date.now()}-${options.filename}`
    
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(key, options.buffer, {
        contentType: options.mimetype,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    const { data: urlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key)

    return {
      url: urlData.publicUrl,
      key,
      size: options.size,
      provider: MediaProvider.SUPABASE,
      metadata: {
        bucket: this.bucket,
        ...options.metadata
      }
    }
  }

  async delete(options: MediaDeleteOptions): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([options.key])

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`)
    }
  }

  getUrl(key: string, transforms?: MediaTransformOptions): string {
    const { data } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(key)

    let url = data.publicUrl

    if (transforms) {
      const params = new URLSearchParams()
      if (transforms.width) params.set('width', transforms.width.toString())
      if (transforms.height) params.set('height', transforms.height.toString())
      if (transforms.quality) params.set('quality', transforms.quality.toString())
      if (transforms.format) params.set('format', transforms.format)
      
      const query = params.toString()
      if (query) {
        url += `?${query}`
      }
    }

    return url
  }

  async isHealthy(): Promise<boolean> {
    try {
      const { data, error } = await this.client.storage.listBuckets()
      return !error && Array.isArray(data)
    } catch {
      return false
    }
  }
}
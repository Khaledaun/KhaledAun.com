import { SupabaseMediaAdapter } from './supabase'
import { CloudinaryMediaAdapter } from './cloudinary'
import { ImgixMediaAdapter } from './imgix'
import { MediaAdapter, MediaProvider, MediaConfig, MediaUploadOptions, MediaUploadResult, MediaDeleteOptions, MediaTransformOptions } from './types'

export class MediaManager {
  private adapters: Map<MediaProvider, MediaAdapter> = new Map()
  private defaultAdapter?: MediaAdapter

  constructor(config: MediaConfig) {
    // Initialize adapters based on configuration
    if (config.supabase) {
      const adapter = new SupabaseMediaAdapter({
        url: config.supabase.url,
        serviceRoleKey: config.supabase.serviceRoleKey,
        bucket: config.supabase.bucket
      })
      this.adapters.set(MediaProvider.SUPABASE, adapter)
      if (!this.defaultAdapter) this.defaultAdapter = adapter
    }

    if (config.cloudinary) {
      const adapter = new CloudinaryMediaAdapter({
        cloudName: config.cloudinary.cloudName,
        apiKey: config.cloudinary.apiKey,
        apiSecret: config.cloudinary.apiSecret,
        folder: config.cloudinary.folder
      })
      this.adapters.set(MediaProvider.CLOUDINARY, adapter)
      if (!this.defaultAdapter) this.defaultAdapter = adapter
    }

    if (config.imgix) {
      const adapter = new ImgixMediaAdapter({
        domain: config.imgix.domain,
        apiKey: config.imgix.apiKey,
        secureUrlToken: config.imgix.secureUrlToken
      })
      this.adapters.set(MediaProvider.IMGIX, adapter)
      if (!this.defaultAdapter) this.defaultAdapter = adapter
    }

    if (this.adapters.size === 0) {
      console.warn('No media adapters configured. Media operations will not work.')
      // Create a mock adapter for build/development environments
      this.defaultAdapter = {
        name: MediaProvider.SUPABASE, // Use a default provider for mocking
        upload: async (options: MediaUploadOptions) => ({ 
          url: 'mock://upload', 
          size: options.size,
          provider: MediaProvider.SUPABASE
        }),
        delete: async () => {},
        getUrl: () => 'mock://url',
        isHealthy: async () => false
      } as MediaAdapter
    }
  }

  async upload(options: MediaUploadOptions, provider?: MediaProvider): Promise<MediaUploadResult> {
    const adapter = provider ? this.adapters.get(provider) : this.defaultAdapter
    
    if (!adapter) {
      throw new Error(`Media adapter not found: ${provider || 'default'}`)
    }

    return adapter.upload(options)
  }

  async delete(options: MediaDeleteOptions, provider: MediaProvider): Promise<void> {
    const adapter = this.adapters.get(provider)
    
    if (!adapter) {
      throw new Error(`Media adapter not found: ${provider}`)
    }

    return adapter.delete(options)
  }

  getUrl(key: string, provider: MediaProvider, transforms?: MediaTransformOptions): string {
    const adapter = this.adapters.get(provider)
    
    if (!adapter) {
      throw new Error(`Media adapter not found: ${provider}`)
    }

    return adapter.getUrl(key, transforms)
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [provider, adapter] of this.adapters) {
      try {
        results[provider] = await adapter.isHealthy()
      } catch {
        results[provider] = false
      }
    }

    return results
  }

  getAvailableProviders(): MediaProvider[] {
    return Array.from(this.adapters.keys())
  }

  hasProvider(provider: MediaProvider): boolean {
    return this.adapters.has(provider)
  }
}

// Factory function to create MediaManager from environment variables
export function createMediaManager(): MediaManager {
  const config: MediaConfig = {}

  // Supabase configuration
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    config.supabase = {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: process.env.SUPABASE_BUCKET || 'media'
    }
  }

  // Cloudinary configuration
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    config.cloudinary = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER
    }
  }

  // Imgix configuration
  if (process.env.IMGIX_DOMAIN && process.env.IMGIX_API_KEY) {
    config.imgix = {
      domain: process.env.IMGIX_DOMAIN,
      apiKey: process.env.IMGIX_API_KEY,
      secureUrlToken: process.env.IMGIX_SECURE_URL_TOKEN
    }
  }

  return new MediaManager(config)
}

// Re-export types and adapters
export * from './types'
export { SupabaseMediaAdapter } from './supabase'
export { CloudinaryMediaAdapter } from './cloudinary'
export { ImgixMediaAdapter } from './imgix'
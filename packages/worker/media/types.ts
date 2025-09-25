export interface MediaUploadOptions {
  filename: string
  mimetype: string
  size: number
  buffer: Buffer
  metadata?: Record<string, any>
}

export interface MediaUploadResult {
  url: string
  key?: string
  width?: number
  height?: number
  size: number
  provider: MediaProvider
  metadata?: Record<string, any>
}

export interface MediaDeleteOptions {
  key: string
  url?: string
}

export interface MediaTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpg' | 'png' | 'webp' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface MediaAdapter {
  name: MediaProvider
  upload(options: MediaUploadOptions): Promise<MediaUploadResult>
  delete(options: MediaDeleteOptions): Promise<void>
  getUrl(key: string, transforms?: MediaTransformOptions): string
  isHealthy(): Promise<boolean>
}

export enum MediaProvider {
  SUPABASE = 'SUPABASE',
  CLOUDINARY = 'CLOUDINARY',
  IMGIX = 'IMGIX',
  LOCAL = 'LOCAL'
}

export interface MediaConfig {
  supabase?: {
    url: string
    anonKey: string
    serviceRoleKey: string
    bucket: string
  }
  cloudinary?: {
    cloudName: string
    apiKey: string
    apiSecret: string
    folder?: string
  }
  imgix?: {
    domain: string
    apiKey: string
    secureUrlToken?: string
  }
}
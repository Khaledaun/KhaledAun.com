import { v2 as cloudinary } from 'cloudinary'
import { MediaAdapter, MediaUploadOptions, MediaUploadResult, MediaDeleteOptions, MediaTransformOptions, MediaProvider } from './types'

export class CloudinaryMediaAdapter implements MediaAdapter {
  name = MediaProvider.CLOUDINARY
  private folder?: string

  constructor(config: {
    cloudName: string
    apiKey: string
    apiSecret: string
    folder?: string
  }) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret
    })
    this.folder = config.folder
  }

  async upload(options: MediaUploadOptions): Promise<MediaUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        resource_type: 'auto',
        folder: this.folder,
        public_id: `${Date.now()}-${options.filename.split('.')[0]}`,
        context: options.metadata
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
            return
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result'))
            return
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
            provider: MediaProvider.CLOUDINARY,
            metadata: {
              format: result.format,
              resourceType: result.resource_type,
              ...options.metadata
            }
          })
        }
      )

      uploadStream.end(options.buffer)
    })
  }

  async delete(options: MediaDeleteOptions): Promise<void> {
    try {
      await cloudinary.uploader.destroy(options.key)
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getUrl(key: string, transforms?: MediaTransformOptions): string {
    const transformations: any[] = []

    if (transforms) {
      if (transforms.width) transformations.push({ width: transforms.width })
      if (transforms.height) transformations.push({ height: transforms.height })
      if (transforms.quality) transformations.push({ quality: transforms.quality })
      if (transforms.format) transformations.push({ format: transforms.format })
      if (transforms.fit) {
        const cropMap = {
          cover: 'fill',
          contain: 'fit',
          fill: 'fill',
          inside: 'fit',
          outside: 'fill'
        }
        transformations.push({ crop: cropMap[transforms.fit] })
      }
    }

    return cloudinary.url(key, {
      transformation: transformations,
      secure: true
    })
  }

  async isHealthy(): Promise<boolean> {
    try {
      await cloudinary.api.ping()
      return true
    } catch {
      return false
    }
  }
}
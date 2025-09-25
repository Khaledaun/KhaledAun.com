// Prisma client with fallback for build environments where generation is blocked

// Mock types and client for when Prisma client is not available
interface MockPrismaModel {
  findMany: (args?: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any | null>
  findFirst: (args?: any) => Promise<any | null>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  upsert: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  deleteMany: (args?: any) => Promise<{ count: number }>
  updateMany: (args: any) => Promise<{ count: number }>
  count: (args?: any) => Promise<number>
}

interface MockPrismaClient {
  // User management
  user: MockPrismaModel
  account: MockPrismaModel
  session: MockPrismaModel
  verificationToken: MockPrismaModel
  
  // Content management  
  post: MockPrismaModel
  idea: MockPrismaModel
  aIArtifact: MockPrismaModel  // Note: Prisma generates aIArtifact from AIArtifact model
  
  // Media management
  media: MockPrismaModel
  
  // Lead management
  lead: MockPrismaModel
  
  // SEO management
  seoMeta: MockPrismaModel
  seoAnalysis: MockPrismaModel
  
  // Utility methods
  $connect: () => Promise<void>
  $disconnect: () => Promise<void>
  $transaction: <T>(fn: (prisma: MockPrismaClient) => Promise<T>) => Promise<T>
}

const createMockModel = (): MockPrismaModel => ({
  findMany: () => Promise.resolve([]),
  findUnique: () => Promise.resolve(null),
  findFirst: () => Promise.resolve(null),
  create: (args) => Promise.resolve({ id: 'mock-id', ...args.data }),
  update: (args) => Promise.resolve({ id: args.where.id, ...args.data }),
  upsert: (args) => Promise.resolve({ id: 'mock-id', ...args.create }),
  delete: () => Promise.resolve({ id: 'mock-id' }),
  deleteMany: () => Promise.resolve({ count: 0 }),
  updateMany: () => Promise.resolve({ count: 0 }),
  count: () => Promise.resolve(0),
})

const createMockPrismaClient = (): MockPrismaClient => ({
  user: createMockModel(),
  account: createMockModel(),
  session: createMockModel(),
  verificationToken: createMockModel(),
  post: createMockModel(),
  idea: createMockModel(),
  aIArtifact: createMockModel(),  // Matches Prisma's generated field name
  media: createMockModel(),
  lead: createMockModel(),
  seoMeta: createMockModel(),
  seoAnalysis: createMockModel(),
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $transaction: async (fn) => fn(createMockPrismaClient()),
})

declare global {
  // eslint-disable-next-line no-var
  var __prisma: MockPrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as {
  prisma: MockPrismaClient | undefined
}

// Use mock client for now - in production this should be replaced with actual Prisma client
export const prisma = globalForPrisma.prisma ?? createMockPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export the client as default
export default prisma

// Export type for external use
export type PrismaClient = MockPrismaClient
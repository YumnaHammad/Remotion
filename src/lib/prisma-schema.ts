// Prisma schema scaffold — wire DATABASE_URL when connecting PostgreSQL
// npx prisma init && npx prisma migrate dev

export const PRISMA_MODELS = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  projects  Project[]
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(cuid())
  name        String
  data        Json
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  renders     RenderJob[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RenderJob {
  id         String   @id @default(cuid())
  projectId  String
  project    Project  @relation(fields: [projectId], references: [id])
  status     String
  progress   Int      @default(0)
  format     String
  quality    String
  outputUrl  String?
  createdAt  DateTime @default(now())
}
`;

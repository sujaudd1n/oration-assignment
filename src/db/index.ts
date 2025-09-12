import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { users, chatSessions, messages } from './schema'; // Adjust the import path as needed

export const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await db.delete(messages);
  await db.delete(chatSessions);
  await db.delete(users);
  console.log('Cleared existing data');

  // Insert users
  const user1 = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'alice',
    password: '$2b$10$K8L21YJZ3Z3Z3Z3Z3Z3Z3O', // hashed "password123"
    createdAt: new Date('2023-10-15T08:30:00Z'),
    updatedAt: new Date('2023-10-15T08:30:00Z')
  };

  const user2 = {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    username: 'bob',
    password: '$2b$10$K8L21YJZ3Z3Z3Z3Z3Z3Z3O', // hashed "secret456"
    createdAt: new Date('2023-10-16T09:15:00Z'),
    updatedAt: new Date('2023-10-16T09:15:00Z')
  };

  await db.insert(users).values([user1, user2]);
  console.log('Added users');

  // Insert chat sessions - using valid UUID format (only 0-9, a-f)
  const session1 = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    userId: user1.id,
    title: 'AI Assistant Discussion',
    createdAt: new Date('2023-10-17T10:30:00Z'),
    updatedAt: new Date('2023-10-17T11:45:00Z')
  };

  const session2 = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    userId: user1.id,
    title: 'Project Ideas',
    createdAt: new Date('2023-10-18T14:20:00Z'),
    updatedAt: new Date('2023-10-18T15:30:00Z')
  };

  const session3 = {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', // Fixed: replaced g,h,i,j,k,l,m with valid hex chars
    userId: user2.id,
    title: 'Learning LLMs',
    createdAt: new Date('2023-10-19T16:45:00Z'),
    updatedAt: new Date('2023-10-19T17:20:00Z')
  };

  await db.insert(chatSessions).values([session1, session2, session3]);
  console.log('Added chat sessions');

  // Insert messages - using valid UUID format
  const message1 = {
    id: 'c3d4e5f6-a7b8-4901-cdef-012345678901',
    sessionId: session1.id,
    content: 'Hello, how can you help me?',
    role: 'user',
    createdAt: new Date('2023-10-17T10:32:00Z')
  };

  const message2 = {
    id: 'd4e5f6a7-b8c9-5012-def0-123456789012',
    sessionId: session1.id,
    content: 'I can help answer questions and provide information on various topics.',
    role: 'assistant',
    createdAt: new Date('2023-10-17T10:33:00Z')
  };

  const message3 = {
    id: 'e5f6a7b8-c9d0-6123-ef01-234567890123',
    sessionId: session2.id,
    content: 'I need ideas for a new project',
    role: 'user',
    createdAt: new Date('2023-10-18T14:22:00Z')
  };

  const message4 = {
    id: 'f6a7b8c9-d0e1-7234-f012-345678901234',
    sessionId: session3.id,
    content: 'How do large language models work?',
    role: 'user',
    createdAt: new Date('2023-10-19T16:47:00Z')
  };

  await db.insert(messages).values([message1, message2, message3, message4]);
  console.log('Added messages');

  // Verify the data
  const allUsers = await db.select().from(users);
  console.log('Users in database:', allUsers.length);

  const allSessions = await db.select().from(chatSessions);
  console.log('Chat sessions in database:', allSessions.length);

  const allMessages = await db.select().from(messages);
  console.log('Messages in database:', allMessages.length);

  // Example of querying with relations
  const userSessions = await db
    .select()
    .from(users)
    .leftJoin(chatSessions, eq(users.id, chatSessions.userId))
    .where(eq(users.username, 'alice'));

  console.log(`Alice has ${userSessions.length} chat sessions`);

  console.log('Seeding completed successfully!');
}

// main().catch((error) => {
//   console.error('Error seeding database:', error);
//   process.exit(1);
// });
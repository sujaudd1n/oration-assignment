import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/index"; // Your database connection
import { chatSessions, messages } from "@/db/schema"; // Your schema
import { TRPCError } from "@trpc/server";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

export const appRouter = router({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
    greeting: `hello ${input.text}`,
  })),

  // Chat routes
  chat: router({
    listSessions: publicProcedure.query(async ({ ctx }) => {
      return await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, ctx.user.id))
        .orderBy(desc(chatSessions.updatedAt));
    }),

    getSession: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const [session] = await db
          .select()
          .from(chatSessions)
          .where(
            and(eq(chatSessions.id, input.id), eq(chatSessions.userId, ctx.user.id)),
          )
          .limit(1);

        const sessionMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, input.id))
          .orderBy(messages.createdAt);

        return {
          ...session,
          messages: sessionMessages,
        };
      }),

    createSession: publicProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        console.log(ctx);
        const [session] = await db
          .insert(chatSessions)
          .values({
            userId: ctx.user.id,
            title: input.title || "New Chat",
          })
          .returning();

        return session;
      }),

    deleteSession: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await db
          .delete(chatSessions)
          .where(
            and(eq(chatSessions.id, input.id), eq(chatSessions.userId, ctx.user.id)),
          );
        return { success: true };
      }),

    sendMessage: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          message: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        // Save user message
        const [userMessage] = await db
          .insert(messages)
          .values({
            sessionId: input.sessionId,
            content: input.message,
            role: "user",
          })
          .returning();

        // Generate AI response (simplified - replace with your actual AI integration)
        const fullResponse = await getCompletion(input.message);

        // Save AI response
        const [aiMessage] = await db
          .insert(messages)
          .values({
            sessionId: input.sessionId,
            content: fullResponse,
            role: "assistant",
          })
          .returning();

        // Update session timestamp
        await db
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, input.sessionId));

        return {
          userMessage,
          aiMessage,
        };
      }),
  }),
});

async function getCompletion(input: str) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: input,
    config: {
      systemInstruction:
        'You are "CareerGuide," a supportive, empathetic, and highly knowledgeable AI career counselor. Your primary goal is to empower users to explore career paths, understand their skills, and make informed decisions about their professional future. You are not a replacement for a human counselor but a first step and ongoing guide. You must be encouraging  and operate within strict ethical guidelines.',
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });
  return response.text;
}

export type AppRouter = typeof appRouter;

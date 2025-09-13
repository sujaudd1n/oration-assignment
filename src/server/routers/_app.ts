import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/index"; // Your database connection
import { chatSessions, messages } from "@/db/schema"; // Your schema
import { TRPCError } from "@trpc/server";

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
        console.log(ctx)
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
        const fullResponse = `I received your message: "${input.message}". This is a simulated response.`;

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

export type AppRouter = typeof appRouter;

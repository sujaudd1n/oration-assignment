import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/index";
import { chatSessions, messages } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function getCompletion(input: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: input,
      config: {
        systemInstruction:
          'You are "CareerGuide," a supportive, empathetic, and highly knowledgeable AI career counselor.',
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI completion error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate AI response",
    });
  }
}

export const appRouter = router({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => ({
    greeting: `hello ${input.text}`,
  })),

  chat: router({
    listSessions: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        return await db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.userId, ctx.user.id))
          .orderBy(desc(chatSessions.updatedAt));
      } catch (error) {
        console.error("Error listing sessions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions",
        });
      }
    }),

    getSession: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        try {
          const [session] = await db
            .select()
            .from(chatSessions)
            .where(
              and(eq(chatSessions.id, input.id), eq(chatSessions.userId, ctx.user.id)),
            )
            .limit(1);

          if (!session) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Chat session not found",
            });
          }

          const sessionMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.sessionId, input.id))
            .orderBy(messages.createdAt);

          return {
            ...session,
            messages: sessionMessages,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error getting session:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chat session",
          });
        }
      }),

    createSession: publicProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        try {
          const [session] = await db
            .insert(chatSessions)
            .values({
              userId: ctx.user.id,
              title: input.title || "New Chat",
            })
            .returning();

          return session;
        } catch (error) {
          console.error("Error creating session:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create chat session",
          });
        }
      }),

    deleteSession: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        try {
          await db
            .delete(chatSessions)
            .where(
              and(eq(chatSessions.id, input.id), eq(chatSessions.userId, ctx.user.id)),
            );
          return { success: true };
        } catch (error) {
          console.error("Error deleting session:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete chat session",
          });
        }
      }),

    sendMessage: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          message: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const [userMessage] = await db
            .insert(messages)
            .values({
              sessionId: input.sessionId,
              content: input.message,
              role: "user",
            })
            .returning();

          const fullResponse = await getCompletion(input.message);

          const [aiMessage] = await db
            .insert(messages)
            .values({
              sessionId: input.sessionId ?? "",
              content: fullResponse ?? "",
              role: "assistant",
            })
            .returning();

          await db
            .update(chatSessions)
            .set({ updatedAt: new Date() })
            .where(eq(chatSessions.id, input.sessionId));

          return {
            userMessage,
            aiMessage,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error sending message:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send message",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

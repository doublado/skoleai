import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';
import OpenAI from 'openai';

interface SendMessageRequest {
  chatId: number;
  userId: number;
  message: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<SendMessageRequest>(event);
    const { chatId, userId, message } = body;

    if (!chatId || !userId || !message) {
      return {
        success: false,
        message: 'Chat ID, User ID, and message content are required.',
      };
    }

    // Insert the user's message into the database
    const insertUserMessageQuery = `
      INSERT INTO messages (chat_id, sender_id, sender_type, content, created_at)
      VALUES (?, ?, 'student', ?, CURRENT_TIMESTAMP)
    `;
    await pool.execute(insertUserMessageQuery, [chatId, userId, message]);

    // Fetch chat history for OpenAI
    const selectMessagesQuery = `
      SELECT sender_type, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC
    `;
    const [messages] = await pool.execute(selectMessagesQuery, [chatId]) as [Array<{ sender_type: string; content: string }>, any];

    // Load the system prompt from environment variables
    const systemPrompt = process.env.AI_SYSTEM_PROMPT || "You are a helpful assistant.";

    // Define the system message for prompt engineering
    const systemMessage = {
      role: 'system',
      content: systemPrompt,
    };

    // Prepare conversation history for OpenAI
    const conversation = [
      systemMessage, // Add the system message first
      ...messages.map((msg) => ({
        role: msg.sender_type === 'student' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ] as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

    // Call OpenAI for response
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo',
      messages: conversation,
    });

    const aiResponse = completion.choices[0].message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Insert the AI's response into the database
    const AI_USER_ID = 1; // Replace with the actual ID of the AI user
    const insertAIMessageQuery = `
      INSERT INTO messages (chat_id, sender_id, sender_type, content, created_at)
      VALUES (?, ?, 'ai', ?, CURRENT_TIMESTAMP)
    `;
    await pool.execute(insertAIMessageQuery, [chatId, AI_USER_ID, aiResponse]);

    return {
      success: true,
      message: aiResponse,
    };
  } catch (error) {
    console.error('Error handling message:', error);
    return {
      success: false,
      message: 'An error occurred while processing the message.',
    };
  }
});
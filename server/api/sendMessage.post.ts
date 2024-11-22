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
    // Parse the incoming request body
    const body = await readBody<SendMessageRequest>(event);
    const { chatId, userId, message } = body;

    if (!chatId || !userId || !message) {
      // Ensure all required fields are present
      return {
        success: false,
        message: 'Chat ID, User ID, and message content are required.',
      };
    }

    // Store the user's message in the database
    const insertUserMessageQuery = `
      INSERT INTO messages (chat_id, sender_id, sender_type, content, created_at)
      VALUES (?, ?, 'student', ?, CURRENT_TIMESTAMP)
    `;
    await pool.execute(insertUserMessageQuery, [chatId, userId, message]);

    // Retrieve the chat history for context in AI's response
    const selectMessagesQuery = `
      SELECT sender_type, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC
    `;
    const [messages] = await pool.execute(selectMessagesQuery, [chatId]) as [Array<{ sender_type: string; content: string }>, any];

    // Load the system prompt to define AI's behavior
    const systemPrompt = process.env.AI_SYSTEM_PROMPT || "You are a helpful assistant.";

    // Add a system message to guide the AI's response style and context
    const systemMessage = {
      role: 'system',
      content: systemPrompt,
    };

    // Format the conversation history for the OpenAI API
    const conversation = [
      systemMessage, // System message for initial guidance
      ...messages.map((msg) => ({
        role: msg.sender_type === 'student' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ] as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

    // Call OpenAI to generate a response
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo', // Use the specified model or fallback to default
      messages: conversation,
    });

    const aiResponse = completion.choices[0].message?.content;

    if (!aiResponse) {
      // Handle cases where OpenAI fails to return a response
      throw new Error('No response from OpenAI');
    }

    // Insert the AI's response into the database
    const AI_USER_ID = 1; // Use a placeholder ID for the AI user
    const insertAIMessageQuery = `
      INSERT INTO messages (chat_id, sender_id, sender_type, content, created_at)
      VALUES (?, ?, 'ai', ?, CURRENT_TIMESTAMP)
    `;
    await pool.execute(insertAIMessageQuery, [chatId, AI_USER_ID, aiResponse]);

    // Return the AI's response to the client
    return {
      success: true,
      message: aiResponse,
    };
  } catch (error) {
    // Log and handle unexpected errors
    console.error('Error handling message:', error);
    return {
      success: false,
      message: 'An error occurred while processing the message.',
    };
  }
});
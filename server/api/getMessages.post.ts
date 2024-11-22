import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface GetMessagesRequest {
  chatId: number;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Parse the request body to extract the chat ID
    const body = await readBody<GetMessagesRequest>(event);
    const { chatId } = body;

    if (!chatId) {
      // Ensure the chat ID is provided to identify the correct chat
      return {
        success: false,
        message: 'Chat ID is required.',
      };
    }

    // Fetch all messages from the specified chat, ordered by creation time
    const query = `
      SELECT sender_type, content, created_at
      FROM messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `;
    const [rows] = await pool.execute(query, [chatId]);

    // Return the messages to the client
    return {
      success: true,
      messages: rows,
    };
  } catch (error) {
    // Log unexpected errors and return an error response
    console.error('Error fetching messages:', error);
    return {
      success: false,
      message: 'An error occurred while fetching messages.',
    };
  }
});
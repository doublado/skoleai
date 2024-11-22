import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface GetMessagesRequest {
  chatId: number;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Parse the request body
    const body = await readBody<GetMessagesRequest>(event);
    const { chatId } = body;

    if (!chatId) {
      return {
        success: false,
        message: 'Chat ID is required.',
      };
    }

    // Query the database for messages in the specified chat
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
    console.error('Error fetching messages:', error);
    return {
      success: false,
      message: 'An error occurred while fetching messages.',
    };
  }
});
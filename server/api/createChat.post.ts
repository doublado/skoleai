import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface CreateChatRequest {
  userId: number;
}

interface Chat {
  id: number;
  created_at: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Parse the incoming request body to extract the user ID
    const body = await readBody<CreateChatRequest>(event);
    const { userId } = body;

    if (!userId) {
      // Ensure user ID is provided to associate the chat with a user
      return {
        success: false,
        message: 'User ID is required to create a chat',
      };
    }

    // Insert a new chat into the database, initializing its created_at timestamp
    const insertQuery = `
      INSERT INTO chats (user_id, created_at, deleted)
      VALUES (?, CURRENT_TIMESTAMP, FALSE)
    `;
    const result = await pool.execute(insertQuery, [userId]) as any;
    const insertResult = result[0]; // Extract the result from the query

    if (insertResult.insertId) {
      const newChatId = insertResult.insertId;

      // Fetch the newly created chat from the database to return its details
      const selectQuery = `SELECT id, created_at FROM chats WHERE id = ?`;
      const resultSelect = await pool.execute(selectQuery, [newChatId]) as any;
      const chatRows = resultSelect[0] as Chat[];

      if (chatRows.length > 0) {
        const newChat = chatRows[0];
        return {
          success: true,
          chat: {
            id: newChat.id,
            created_at: newChat.created_at,
            messages: [], // Placeholder for messages, allowing future expansions
          },
        };
      } else {
        // Handle rare case where the chat creation succeeded, but the fetch did not
        return {
          success: false,
          message: 'Chat not found after creation',
        };
      }
    } else {
      // Handle failure to insert the chat in the database
      return {
        success: false,
        message: 'Failed to create chat',
      };
    }
  } catch (error) {
    // Log and return an error response in case of unexpected issues
    console.error('Error creating chat:', error);
    return {
      success: false,
      message: 'An error occurred while creating the chat',
    };
  }
});
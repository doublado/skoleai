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
    const body = await readBody<CreateChatRequest>(event);
    const { userId } = body;

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required to create a chat',
      };
    }

    const insertQuery = `
      INSERT INTO chats (user_id, created_at, deleted)
      VALUES (?, CURRENT_TIMESTAMP, FALSE)
    `;
    const result = await pool.execute(insertQuery, [userId]) as any;
    const insertResult = result[0]; // Get the result object from the tuple

    if (insertResult.insertId) {
      const newChatId = insertResult.insertId;

      // Fetch the newly created chat to return to the client
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
            messages: [], // Placeholder for potential messages array
          },
        };
      } else {
        return {
          success: false,
          message: 'Chat not found after creation',
        };
      }
    } else {
      return {
        success: false,
        message: 'Failed to create chat',
      };
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    return {
      success: false,
      message: 'An error occurred while creating the chat',
    };
  }
});
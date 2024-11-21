import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface DeleteChatRequest {
  chatId: number;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<DeleteChatRequest>(event);
    const { chatId } = body;

    if (!chatId) {
      return {
        success: false,
        message: 'Chat ID is required',
      };
    }

    // Update the 'deleted' column to TRUE to indicate the chat is soft deleted
    const query = `UPDATE chats SET deleted = TRUE WHERE id = ?`;
    const [result] = await pool.execute(query, [chatId]);

    if ((result as any).affectedRows > 0) {
      return {
        success: true,
        message: 'Chat marked as deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Failed to delete chat',
      };
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the chat',
    };
  }
});
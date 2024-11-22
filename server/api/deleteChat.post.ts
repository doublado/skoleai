import pool from '../db/mysql';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface DeleteChatRequest {
  chatId: number;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Parse the request body to extract the chat ID
    const body = await readBody<DeleteChatRequest>(event);
    const { chatId } = body;

    if (!chatId) {
      // Ensure the request includes the chat ID
      return {
        success: false,
        message: 'Chat ID is required',
      };
    }

    // Perform a soft delete by marking the 'deleted' column as TRUE
    const query = `UPDATE chats SET deleted = TRUE WHERE id = ?`;
    const [result] = await pool.execute(query, [chatId]);

    if ((result as any).affectedRows > 0) {
      // Confirm the chat was marked as deleted
      return {
        success: true,
        message: 'Chat marked as deleted successfully',
      };
    } else {
      // Handle cases where the chat ID does not exist or the update fails
      return {
        success: false,
        message: 'Failed to delete chat',
      };
    }
  } catch (error) {
    // Log unexpected errors and return an error response
    console.error('Error deleting chat:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the chat',
    };
  }
});
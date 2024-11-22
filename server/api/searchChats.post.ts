import { defineEventHandler, readBody } from 'h3';
import pool from '../db/mysql'; // Database connection configuration
import type { RowDataPacket } from 'mysql2';

interface SearchChatsRequest {
  query: string; // The user's search query
}

interface ChatSearchResult {
  id: number; // Chat ID
  user_name: string; // Name of the user associated with the chat
  created_at: string; // Timestamp when the chat was created
}

export default defineEventHandler(async (event) => {
  try {
    // Read the search query from the incoming request body
    const { query } = await readBody<SearchChatsRequest>(event);

    if (!query || query.trim() === '') {
      // Ensure the search query is not empty to avoid unnecessary database queries
      return {
        success: false,
        message: 'Search query cannot be empty.',
      };
    }

    // Execute a SQL query to search chats by user name or chat ID
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        chats.id, 
        users.name AS user_name, 
        chats.created_at 
      FROM 
        chats 
      INNER JOIN 
        users 
      ON 
        chats.user_id = users.id 
      WHERE 
        users.name LIKE ? 
        OR chats.id LIKE ?
      ORDER BY 
        chats.created_at DESC
      LIMIT 20
      `,
      [`%${query}%`, `%${query}%`] // Use wildcards for partial matching
    );

    // Map the database rows into a structured format for the response
    const results: ChatSearchResult[] = rows.map((row) => ({
      id: row.id,
      user_name: row.user_name,
      created_at: row.created_at,
    }));

    // Return the search results to the client
    return {
      success: true,
      results,
    };
  } catch (error) {
    // Log unexpected errors and return a failure response
    console.error('Error in /api/searchChats:', error);
    return {
      success: false,
      message: 'An error occurred while searching for chats.',
    };
  }
});
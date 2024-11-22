import { defineEventHandler, readBody } from 'h3';
import pool from '../db/mysql'; // Adjust the path to your MySQL connection file
import type { RowDataPacket } from 'mysql2';

interface SearchChatsRequest {
  query: string;
}

interface ChatSearchResult {
  id: number;
  user_name: string;
  created_at: string;
}

export default defineEventHandler(async (event) => {
  try {
    // Read the incoming request body
    const { query } = await readBody<SearchChatsRequest>(event);

    if (!query || query.trim() === '') {
      return {
        success: false,
        message: 'Search query cannot be empty.',
      };
    }

    // Execute the query and typecast the result to RowDataPacket[]
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
      [`%${query}%`, `%${query}%`]
    );

    // Transform RowDataPacket[] into ChatSearchResult[]
    const results: ChatSearchResult[] = rows.map((row) => ({
      id: row.id,
      user_name: row.user_name,
      created_at: row.created_at,
    }));

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Error in /api/searchChats:', error);
    return {
      success: false,
      message: 'An error occurred while searching for chats.',
    };
  }
});
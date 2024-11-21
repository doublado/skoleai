import pool from '../db/mysql';
import bcrypt from 'bcrypt';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
}

interface Chat {
  id: number;
  created_at: string;
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<LoginRequest>(event);
    const { email, password } = body;

    if (!email || !password) {
      return {
        success: false,
        message: 'E-mail og adgangskode er påkrævet',
      };
    }

    const userQuery = `SELECT * FROM users WHERE email = ?`;
    const [userRows] = await pool.execute(userQuery, [email]) as [any, any];
    const users = userRows as User[];

    if (users.length === 0) {
      return {
        success: false,
        message: 'Ugyldig e-mail eller adgangskode',
      };
    }

    const user = users[0];

    // Verify if the provided password matches the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Ugyldig e-mail eller adgangskode',
      };
    }

    // Fetch user chat data for personalized dashboard experience
    const chatsQuery = `
      SELECT id, created_at 
      FROM chats 
      WHERE user_id = ? AND deleted = FALSE
    `;
    const [chatRows] = await pool.execute(chatsQuery, [user.id]) as [any, any];
    const chats = chatRows as Chat[];

    return {
      success: true,
      message: 'Login succesfuldt',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      chats: chats.map((chat) => ({
        id: chat.id,
        created_at: chat.created_at,
        messages: [], // Placeholder for messages, which can be fetched separately
      })),
    };
  } catch (error) {
    console.error('Fejl ved login:', error);
    return {
      success: false,
      message: 'Der opstod en fejl under login',
    };
  }
});
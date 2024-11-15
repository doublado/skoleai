import pool from '../db/mysql';
import bcrypt from 'bcrypt';
import { H3Event, defineEventHandler, readBody } from 'h3';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<RegisterRequest>(event);
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return {
        success: false,
        message: 'Alle felter skal udfyldes'
      };
    }

    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    // Ensure password meets security requirements
    if (!passwordRequirements.test(password)) {
      return {
        success: false,
        message: 'Adgangskode skal være mindst 8 tegn og indeholde store bogstaver, små bogstaver, tal og symboler'
      };
    }

    // Prevent passwords that are too similar to the user's name
    if (password.toLowerCase().includes(name.toLowerCase())) {
      return {
        success: false,
        message: 'Adgangskode må ikke ligne brugernavnet for meget'
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const [result] = await pool.execute(query, [name, email, hashedPassword, role]);

      // Confirm user was successfully inserted into the database
      if ((result as any).affectedRows > 0) {
        return {
          success: true,
          message: 'Bruger registreret med succes'
        };
      } else {
        return {
          success: false,
          message: 'Kunne ikke registrere brugeren, prøv igen'
        };
      }
    } catch (dbError: any) {
      // Handle duplicate email entries
      if (dbError.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          message: 'E-mailen er allerede registreret'
        };
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Fejl ved registrering:', error);
    return {
      success: false,
      message: 'Der opstod en fejl under registreringen'
    };
  }
});
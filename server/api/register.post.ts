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
    // Parse the incoming request body to extract registration data
    const body = await readBody<RegisterRequest>(event);
    const { name, email, password, role } = body;

    // Ensure all fields are provided before proceeding
    if (!name || !email || !password || !role) {
      return {
        success: false,
        message: 'Alle felter skal udfyldes'
      };
    }

    // Define strong password requirements to enhance security
    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRequirements.test(password)) {
      // Enforce password complexity rules
      return {
        success: false,
        message: 'Adgangskode skal være mindst 8 tegn og indeholde store bogstaver, små bogstaver, tal og symboler'
      };
    }

    if (password.toLowerCase().includes(name.toLowerCase())) {
      // Prevent the password from being too similar to the user's name
      return {
        success: false,
        message: 'Adgangskode må ikke ligne brugernavnet for meget'
      };
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    try {
      // Insert the new user into the database
      const [result] = await pool.execute(query, [name, email, hashedPassword, role]);

      if ((result as any).affectedRows > 0) {
        // Confirm successful registration
        return {
          success: true,
          message: 'Bruger registreret med succes'
        };
      } else {
        // Handle cases where the insertion fails unexpectedly
        return {
          success: false,
          message: 'Kunne ikke registrere brugeren, prøv igen'
        };
      }
    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        // Handle duplicate email errors gracefully
        return {
          success: false,
          message: 'E-mailen er allerede registreret'
        };
      }
      throw dbError; // Rethrow other database errors
    }
  } catch (error) {
    // Log unexpected errors and return a failure response
    console.error('Fejl ved registrering:', error);
    return {
      success: false,
      message: 'Der opstod en fejl under registreringen'
    };
  }
});
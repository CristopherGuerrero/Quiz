const sql = require('mssql');
const bcrypt = require('bcryptjs');
const dbConfig = require('./cris.env').dbConfig;

// Configuración de bcrypt
const SALT_ROUNDS = 10;

/**
 * Registra un nuevo usuario en el sistema
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña en texto plano
 * @param {string} email - Email del usuario
 * @param {boolean} isAdmin - Si el usuario es administrador
 * @returns {Promise<object>} Objeto con el resultado de la operación
 */
async function registerUser(username, password, email, isAdmin = false) {
    try {
        // Validar que el usuario no exista
        const pool = await sql.connect(dbConfig);
        const userCheck = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .query('SELECT id FROM Users WHERE username = @username');
        
        if (userCheck.recordset.length > 0) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Insertar nuevo usuario
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('password', sql.NVarChar(255), hashedPassword)
            .input('email', sql.NVarChar(100), email)
            .input('isAdmin', sql.Bit, isAdmin)
            .query(`INSERT INTO Users (username, password, email, isAdmin)
                   VALUES (@username, @password, @email, @isAdmin);
                   SELECT SCOPE_IDENTITY() AS id;`);
        
        return { 
            success: true, 
            userId: result.recordset[0].id,
            username,
            isAdmin 
        };
    } catch (error) {
        console.error('Error en registerUser:', error);
        return { success: false, message: 'Error al registrar usuario' };
    } finally {
        sql.close();
    }
}

/**
 * Autentica un usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<object>} Objeto con el usuario si las credenciales son válidas
 */
async function login(username, password) {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .query('SELECT id, username, password, isAdmin FROM Users WHERE username = @username');
        
        if (result.recordset.length === 0) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return { success: false, message: 'Contraseña incorrecta' };
        }
        
        return { 
            success: true,
            userId: user.id,
            username: user.username,
            isAdmin: user.isAdmin
        };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, message: 'Error al iniciar sesión' };
    } finally {
        sql.close();
    }
}

/**
 * Cambia la contraseña de un usuario
 * @param {number} userId - ID del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<object>} Resultado de la operación
 */
async function changePassword(userId, currentPassword, newPassword) {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Verificar contraseña actual
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT password FROM Users WHERE id = @userId');
        
        if (userResult.recordset.length === 0) {
            return { success: false, message: 'Usuario no encontrado' };
        }
        
        const user = userResult.recordset[0];
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!passwordMatch) {
            return { success: false, message: 'Contraseña actual incorrecta' };
        }
        
        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('newPassword', sql.NVarChar(255), hashedPassword)
            .query('UPDATE Users SET password = @newPassword WHERE id = @userId');
        
        return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
        console.error('Error en changePassword:', error);
        return { success: false, message: 'Error al cambiar la contraseña' };
    } finally {
        sql.close();
    }
}

/**
 * Verifica si un usuario está autenticado
 * @param {object} req - Objeto de solicitud HTTP
 * @returns {Promise<object>} Información del usuario si está autenticado
 */
async function authenticate(req) {
    try {
        // En un entorno real, aquí verificarías el token JWT o la sesión
        const token = req.headers.authorization;
        if (!token) {
            return { authenticated: false };
        }
        
        // Verificación simplificada para el ejemplo
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('token', sql.NVarChar(255), token)
            .query(`SELECT u.id, u.username, u.isAdmin 
                   FROM Users u
                   JOIN Sessions s ON u.id = s.userId
                   WHERE s.token = @token AND s.expiresAt > GETDATE()`);
        
        if (result.recordset.length === 0) {
            return { authenticated: false };
        }
        
        return {
            authenticated: true,
            user: result.recordset[0]
        };
    } catch (error) {
        console.error('Error en authenticate:', error);
        return { authenticated: false };
    } finally {
        sql.close();
    }
}

module.exports = {
    registerUser,
    login,
    changePassword,
    authenticate
};
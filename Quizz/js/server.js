const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const auth = require('./auth');
const dbConfig = require('./cris.env').dbConfig;

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('userId', sql.Int, decoded.userId)
            .query('SELECT id, username, isAdmin FROM Users WHERE id = @userId');
        
        if (result.recordset.length === 0) {
            return res.sendStatus(403);
        }
        
        req.user = result.recordset[0];
        next();
    } catch (err) {
        console.error('Error en autenticación:', err);
        res.sendStatus(403);
    }
};

// Conexión a la base de datos
sql.connect(dbConfig).then(() => {
    console.log('Conectado a SQL Server');
}).catch(err => {
    console.error('Error de conexión a la base de datos:', err);
});

// Rutas de autenticación
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await auth.login(username, password);
    
    if (result.success) {
        const token = jwt.sign(
            { userId: result.userId },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );
        res.json({ token, user: result });
    } else {
        res.status(401).json({ message: result.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    const result = await auth.registerUser(username, password, email);
    
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(400).json({ message: result.message });
    }
});

// Rutas de preguntas
app.get('/api/questions', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT q.id, q.questionText, q.options, q.correctAnswerIndex, 
                   q.difficulty, c.name AS categoryName
                   FROM Questions q
                   LEFT JOIN Categories c ON q.categoryId = c.id
                   WHERE q.isActive = 1`);
        
        res.json(result.recordset.map(q => ({
            ...q,
            options: JSON.parse(q.options)
        }));
    } catch (err) {
        console.error('Error al obtener preguntas:', err);
        res.status(500).json({ message: 'Error al obtener preguntas' });
    }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'No autorizado' });
    }
    
    const { questionText, options, correctAnswerIndex, categoryId, difficulty } = req.body;
    
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('questionText', sql.NVarChar(500), questionText)
            .input('options', sql.NVarChar(sql.MAX), JSON.stringify(options))
            .input('correctAnswerIndex', sql.Int, correctAnswerIndex)
            .input('categoryId', sql.Int, categoryId)
            .input('difficulty', sql.TinyInt, difficulty)
            .input('createdBy', sql.Int, req.user.id)
            .query(`INSERT INTO Questions 
                   (questionText, options, correctAnswerIndex, categoryId, difficulty, createdBy)
                   VALUES (@questionText, @options, @correctAnswerIndex, @categoryId, @difficulty, @createdBy)`);
        
        res.status(201).json({ message: 'Pregunta creada exitosamente' });
    } catch (err) {
        console.error('Error al crear pregunta:', err);
        res.status(500).json({ message: 'Error al crear pregunta' });
    }
});

// Rutas de flashcards
app.get('/api/flashcards', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT f.id, f.question, f.answer, c.name AS categoryName
                   FROM Flashcards f
                   LEFT JOIN Categories c ON f.categoryId = c.id
                   WHERE f.isActive = 1`);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener flashcards:', err);
        res.status(500).json({ message: 'Error al obtener flashcards' });
    }
});

// Rutas de estadísticas
app.get('/api/stats/overview', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .query(`SELECT 
                   (SELECT COUNT(*) FROM Users) AS totalUsers,
                   (SELECT COUNT(*) FROM Questions WHERE isActive = 1) AS totalQuestions,
                   (SELECT COUNT(*) FROM Flashcards WHERE isActive = 1) AS totalFlashcards,
                   (SELECT COUNT(*) FROM QuizAttempts) AS totalQuizAttempts,
                   (SELECT COUNT(*) FROM FlashcardInteractions) AS totalFlashcardViews`);
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

process.on('SIGINT', () => {
    sql.close();
    process.exit();
});
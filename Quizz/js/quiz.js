// Estado global del quiz
let quizState = {
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    startTime: null,
    endTime: null,
    timerInterval: null,
    elapsedSeconds: 0,
    userId: null
};

// Elementos del DOM
const domElements = {
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    progress: document.getElementById('progress'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    submitBtn: document.getElementById('submit-btn'),
    resultsContainer: document.getElementById('results-container'),
    resultsText: document.getElementById('results-text'),
    statsContainer: document.getElementById('stats-container'),
    timer: document.getElementById('timer')
};

// Inicializar el quiz
async function initQuiz(userId) {
    quizState = {
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        score: 0,
        startTime: new Date(),
        endTime: null,
        timerInterval: null,
        elapsedSeconds: 0,
        userId: userId
    };
    
    // Cargar preguntas desde la API
    try {
        const response = await fetch('/api/questions');
        quizState.questions = await response.json();
        
        // Inicializar array de respuestas
        quizState.userAnswers = new Array(quizState.questions.length).fill(null);
        
        // Iniciar temporizador
        startTimer();
        
        // Mostrar primera pregunta
        displayQuestion();
    } catch (error) {
        console.error('Error al cargar preguntas:', error);
        alert('Error al cargar las preguntas. Por favor intenta nuevamente.');
    }
}

// Mostrar pregunta actual
function displayQuestion() {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    // Actualizar texto de la pregunta
    domElements.questionText.textContent = currentQuestion.text;
    
    // Limpiar opciones anteriores
    domElements.optionsContainer.innerHTML = '';
    
    // Crear opciones de respuesta
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        if (quizState.userAnswers[quizState.currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectAnswer(index));
        domElements.optionsContainer.appendChild(optionElement);
    });
    
    // Actualizar progreso
    domElements.progress.textContent = `Pregunta ${quizState.currentQuestionIndex + 1} de ${quizState.questions.length}`;
    
    // Actualizar botones
    domElements.prevBtn.disabled = quizState.currentQuestionIndex === 0;
    
    // Mostrar botón de enviar si es la última pregunta
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        domElements.nextBtn.style.display = 'none';
        domElements.submitBtn.style.display = 'block';
    } else {
        domElements.nextBtn.style.display = 'block';
        domElements.submitBtn.style.display = 'none';
    }
}

// Seleccionar respuesta
function selectAnswer(answerIndex) {
    // Deseleccionar todas las opciones
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Seleccionar la opción clickeada
    options[answerIndex].classList.add('selected');
    
    // Guardar respuesta
    quizState.userAnswers[quizState.currentQuestionIndex] = answerIndex;
}

// Pregunta anterior
function prevQuestion() {
    if (quizState.currentQuestionIndex > 0) {
        quizState.currentQuestionIndex--;
        displayQuestion();
    }
}

// Siguiente pregunta
function nextQuestion() {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        displayQuestion();
    }
}

// Iniciar temporizador
function startTimer() {
    quizState.timerInterval = setInterval(() => {
        quizState.elapsedSeconds++;
        const minutes = Math.floor(quizState.elapsedSeconds / 60);
        const seconds = quizState.elapsedSeconds % 60;
        domElements.timer.textContent = `Tiempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Finalizar quiz
async function finishQuiz() {
    // Detener temporizador
    clearInterval(quizState.timerInterval);
    quizState.endTime = new Date();
    
    // Calcular puntaje
    quizState.score = 0;
    quizState.questions.forEach((question, index) => {
        if (quizState.userAnswers[index] === question.correctIndex) {
            quizState.score++;
        }
    });
    
    // Mostrar resultados
    showResults();
    
    // Guardar intento en la base de datos (si el usuario está logueado)
    if (quizState.userId) {
        try {
            await saveQuizAttempt();
            await updateUserStats();
        } catch (error) {
            console.error('Error al guardar resultados:', error);
        }
    }
}

// Mostrar resultados
function showResults() {
    const correctAnswers = quizState.score;
    const totalQuestions = quizState.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    domElements.resultsContainer.style.display = 'block';
    domElements.resultsText.innerHTML = `
        <p>Respuestas correctas: ${correctAnswers} de ${totalQuestions}</p>
        <p>Porcentaje de aciertos: ${percentage}%</p>
        <p>Tiempo total: ${formatTime(quizState.elapsedSeconds)}</p>
    `;
    
    // Ocultar controles
    domElements.prevBtn.style.display = 'none';
    domElements.nextBtn.style.display = 'none';
    domElements.submitBtn.style.display = 'none';
}

// Formatear tiempo
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Guardar intento de quiz en la base de datos
async function saveQuizAttempt() {
    const wrongAnswers = quizState.questions.length - quizState.score;
    
    try {
        const response = await fetch('/api/quiz-attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: quizState.userId,
                score: quizState.score,
                wrongAnswers: wrongAnswers,
                duration: quizState.elapsedSeconds
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al guardar el intento');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Actualizar estadísticas del usuario
async function updateUserStats() {
    try {
        const response = await fetch(`/api/users/${quizState.userId}/stats`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar estadísticas');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
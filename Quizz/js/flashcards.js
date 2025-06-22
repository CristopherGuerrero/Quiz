// Estado global de las flashcards
let flashcardState = {
    cards: [],
    currentCardIndex: 0,
    isAnswerShown: false,
    userId: null,
    startTime: null,
    viewDuration: 0,
    timerInterval: null
};

// Elementos del DOM
const flashcardElements = {
    cardContainer: document.getElementById('flashcard-container'),
    question: document.getElementById('flashcard-question'),
    answer: document.getElementById('flashcard-answer'),
    prevBtn: document.getElementById('flashcard-prev'),
    nextBtn: document.getElementById('flashcard-next'),
    showBtn: document.getElementById('flashcard-show'),
    shuffleBtn: document.getElementById('flashcard-shuffle'),
    counter: document.getElementById('flashcard-counter'),
    timer: document.getElementById('flashcard-timer')
};

// Inicializar flashcards
async function initFlashcards(userId) {
    flashcardState = {
        cards: [],
        currentCardIndex: 0,
        isAnswerShown: false,
        userId: userId,
        startTime: new Date(),
        viewDuration: 0,
        timerInterval: null
    };
    
    try {
        // Cargar flashcards desde la API
        const response = await fetch('/api/flashcards');
        flashcardState.cards = await response.json();
        
        if (flashcardState.cards.length === 0) {
            flashcardElements.cardContainer.innerHTML = '<p>No hay flashcards disponibles</p>';
            return;
        }
        
        // Iniciar temporizador
        startFlashcardTimer();
        
        // Mostrar primera flashcard
        displayCurrentCard();
    } catch (error) {
        console.error('Error al cargar flashcards:', error);
        flashcardElements.cardContainer.innerHTML = '<p>Error al cargar las flashcards</p>';
    }
}

// Mostrar tarjeta actual
function displayCurrentCard() {
    if (flashcardState.cards.length === 0) return;
    
    const currentCard = flashcardState.cards[flashcardState.currentCardIndex];
    flashcardElements.question.textContent = currentCard.question;
    flashcardElements.answer.textContent = currentCard.answer;
    flashcardElements.answer.style.display = 'none';
    flashcardState.isAnswerShown = false;
    
    // Actualizar contador
    flashcardElements.counter.textContent = `${flashcardState.currentCardIndex + 1}/${flashcardState.cards.length}`;
    
    // Actualizar botones de navegación
    flashcardElements.prevBtn.disabled = flashcardState.currentCardIndex === 0;
    flashcardElements.nextBtn.disabled = flashcardState.currentCardIndex === flashcardState.cards.length - 1;
    
    // Reiniciar temporizador de visualización
    resetViewTimer();
}

// Mostrar/ocultar respuesta
function toggleAnswer() {
    flashcardState.isAnswerShown = !flashcardState.isAnswerShown;
    flashcardElements.answer.style.display = flashcardState.isAnswerShown ? 'block' : 'none';
    
    // Registrar interacción
    if (flashcardState.isAnswerShown) {
        logInteraction('reveal');
    }
}

// Siguiente tarjeta
function nextCard() {
    if (flashcardState.currentCardIndex < flashcardState.cards.length - 1) {
        // Registrar tiempo de visualización
        logInteraction('view');
        
        flashcardState.currentCardIndex++;
        flashcardState.isAnswerShown = false;
        displayCurrentCard();
    }
}

// Tarjeta anterior
function prevCard() {
    if (flashcardState.currentCardIndex > 0) {
        // Registrar tiempo de visualización
        logInteraction('view');
        
        flashcardState.currentCardIndex--;
        flashcardState.isAnswerShown = false;
        displayCurrentCard();
    }
}

// Barajar tarjetas
function shuffleCards() {
    // Registrar tiempo de visualización de la tarjeta actual
    logInteraction('view');
    
    // Algoritmo de Fisher-Yates para barajar
    for (let i = flashcardState.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcardState.cards[i], flashcardState.cards[j]] = [flashcardState.cards[j], flashcardState.cards[i]];
    }
    
    flashcardState.currentCardIndex = 0;
    flashcardState.isAnswerShown = false;
    displayCurrentCard();
    
    // Registrar acción de barajar
    logInteraction('shuffle');
}

// Iniciar temporizador global
function startFlashcardTimer() {
    flashcardState.startTime = new Date();
    flashcardState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - flashcardState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        flashcardElements.timer.textContent = `Tiempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Temporizador de visualización por tarjeta
function resetViewTimer() {
    flashcardState.viewDuration = 0;
}

// Registrar interacción
async function logInteraction(action) {
    if (!flashcardState.userId) return;
    
    const cardId = flashcardState.cards[flashcardState.currentCardIndex].id;
    const duration = flashcardState.viewDuration;
    
    try {
        const response = await fetch('/api/flashcard-interactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: flashcardState.userId,
                cardId: cardId,
                action: action,
                duration: duration
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al registrar interacción');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Configurar event listeners
function setupFlashcardListeners() {
    flashcardElements.showBtn.addEventListener('click', toggleAnswer);
    flashcardElements.nextBtn.addEventListener('click', nextCard);
    flashcardElements.prevBtn.addEventListener('click', prevCard);
    flashcardElements.shuffleBtn.addEventListener('click', shuffleCards);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { id: null };
    initFlashcards(user.id);
    setupFlashcardListeners();
});
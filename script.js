document.addEventListener('DOMContentLoaded', () => {
    const roscoContainer = document.getElementById('rosco');
    const gameTitleDisplay = document.getElementById('game-title'); // Nuevo: Referencia al título
    const timerDisplay = document.getElementById('timer');
    const toggleTimerButton = document.getElementById('toggle-timer-button');
    const customizeButton = document.getElementById('customize-button');
    const customizeModal = document.getElementById('customize-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const gameTitleInput = document.getElementById('game-title-input'); // Nuevo: Input del título en el modal
    const lettersInput = document.getElementById('letters-input');
    const timerInput = document.getElementById('timer-input');
    const saveSettingsButton = document.getElementById('save-settings-button');
    const restartGameButton = document.getElementById('restart-game-button'); // Nuevo: Botón de reiniciar
    const successText = document.getElementById('success-text'); 
    const failureText = document.getElementById('failure-text');

    const toggleGameButton = document.getElementById('toggle-button');
    const moveGameButton = document.getElementById('move-button');
    const gameContainer = document.querySelector('.game-container');
    const innerContent = document.querySelector('.inner-content');

    // --- VARIABLES GLOBALES DE CONFIGURACIÓN ---
    let currentLetters = [];
    let initialTimeInSeconds = 300;
    let gameTitle = 'Pasapalabra'; // Nuevo: Variable para el título del juego

    let numLetters;
    let timeRemaining = initialTimeInSeconds;
    let timerInterval = null;
    let isTimerRunning = false;
    let gameStarted = false; // Indica si el juego ha sido iniciado (Game Start)
    let gameOver = false; // Indica si el juego ha terminado por tiempo
    let innerContentShowed = true; 
    let gameContainerMoved = false; 

    let estadoJuegoTest = {
        currentLetters: [
            { char: 'A', state: 'sin-responder', anwsered: null },
            { char: 'B', state: 'sin-responder', anwsered: null },
            { char: 'C', state: 'sin-responder', anwsered: null }
            // Aquí irían todas tus 27 letras con su estado inicial
        ],
        tiempoRestante: initialTimeInSeconds,
        aciertos: 0,
        fallos: 0
    };

    let estadoJuego = { 
        gameTitle: gameTitle,
        initialTimeInSeconds: initialTimeInSeconds,
        currentLetters: currentLetters.map(objeto => ({
            ...objeto,
            state: '',
            anwsered: ''
        })),
        tiempoRestante: initialTimeInSeconds,
        aciertos: 0,
        fallos: 0,
        textTimerButton: 'Comenzar',
        disabledTimerButton: false
    }
    
    // --- Funciones de Juego ---

    function createRosco() {
        // Limpiar el rosco de letras existentes antes de recrearlas
        roscoContainer.querySelectorAll('.letter').forEach(letter => letter.remove());

        // Asegurarse de que tenemos letras para el rosco
        if (currentLetters.length === 0) {
            console.warn('No hay elementos definidos para el rosco. Usando el alfabeto por defecto.');
            // Puedes cargar un set de letras por defecto si el usuario no introduce nada
            currentLetters = [
                { char: 'A', question: 'Con la A: Animal doméstico que rebuzna.', answer: 'Asno' },
                { char: 'B', question: 'Con la B: Recipiente para beber.', answer: 'Botella' },
                { char: 'C', question: 'Con la C: Elemento químico.', answer: 'Cobre' },
                { char: 'D', question: 'Con la D: Herramienta.', answer: 'Taladro' },
                { char: 'E', question: 'Con la E: Animal muy pesado.', answer: 'Elefante' },
                { char: 'F', question: 'Con la F: Estación.', answer: 'Otoño' },
                { char: 'G', question: 'Con la G: Cereal.', answer: 'Arroz' },
                { char: 'H', question: 'Con la H: Sinónimo de hogar.', answer: 'Casa' },
                { char: 'I', question: 'Con la I: Instrumento musical de cuerda.', answer: 'Guitarra' },
                { char: 'J', question: 'Con la J: Pieza de vestir de tela vaquera.', answer: 'Jeans' },
                { char: 'K', question: 'Con la K: Fruta común.', answer: 'Kiwi' },
                { char: 'L', question: 'Con la L: Sinónimo de veloz.', answer: 'Rápido' },
                { char: 'M', question: 'Con la M: Nombre de un mes de primavera.', answer: 'Mayo' },
                { char: 'N', question: 'Con la N: Número impar que sigue al ocho.', answer: 'Nueve' },
                { char: 'Ñ', question: 'Con la Ñ: Animal grande con cuernos que vive en la selva.', answer: 'Ñu' },
                { char: 'O', question: 'Con la O: Planeta más cercano al sol.', answer: 'Mercurio' },
                { char: 'P', question: 'Con la P: Líquido que beben las plantas.', answer: 'Agua' },
                { char: 'Q', question: 'Con la Q: Utensilio de cocina para cortar.', answer: 'Cuchillo' },
                { char: 'R', question: 'Con la R: Sinónimo de obsequio.', answer: 'Regalo' },
                { char: 'S', question: 'Con la S: Astro que ilumina de día.', answer: 'Sol' },
                { char: 'T', question: 'Con la T: Vehículo de transporte público de pasajeros.', answer: 'Tren' },
                { char: 'U', question: 'Con la U: Fruta pequeña, redonda y dulce, que crece en racimos.', answer: 'Uva' },
                { char: 'V', question: 'Con la V: Nombre de un sentido.', answer: 'Vista' },
                { char: 'W', question: 'Con la W: Lobo en inglés.', answer: 'Wolf' },
                { char: 'X', question: 'Con la X: Instrumento musical.', answer: 'Xilófono' },
                { char: 'Y', question: 'Con la Y: Amarillo en inglés.', answer: 'Yellow' },
                { char: 'Z', question: 'Con la Z: Cebra en inglés', answer: 'Zebra' }
            ];
        }

        numLetters = currentLetters.length;

        const currentRoscoWidth = roscoContainer.offsetWidth;
        const currentRoscoHeight = roscoContainer.offsetHeight;
        const radius = Math.min(currentRoscoWidth, currentRoscoHeight) / 2;

        const angleIncrement = (2 * Math.PI) / numLetters;
        const startAngle = -Math.PI / 2;

        currentLetters.forEach((item, index) => {
            const angle = startAngle + (index * angleIncrement);

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            const letterDiv = document.createElement('div');
            letterDiv.classList.add('letter');
            letterDiv.id = `letter-${item.char.toLowerCase().replace(/[^a-z0-9]/g, '')}-${index}`;
            letterDiv.dataset.char = item.char;
            letterDiv.dataset.question = item.question;
            letterDiv.dataset.answer = item.answer;
            letterDiv.textContent = item.char;

            const letterSize = letterDiv.offsetWidth || letterDiv.offsetHeight || (radius * 0.2);

            letterDiv.style.left = `${x + radius - (letterSize / 2)}px`;
            letterDiv.style.top = `${y + radius - (letterSize / 2)}px`;

            letterDiv.addEventListener('click', () => handleLetterClick(letterDiv));
            roscoContainer.appendChild(letterDiv);
        });
    }

    function handleLetterClick(letterElement) {
        if (!gameStarted || gameOver) {
            console.log("El juego no ha empezado o ya terminó.");
            return;
        }

        const char = letterElement.dataset.char;
        const question = letterElement.dataset.question;

        console.log(`Pregunta para ${char}: ${question}`);

        if (letterElement.classList.contains('correct')) {
            letterElement.classList.remove('correct');
            letterElement.classList.add('incorrect');
        } else if (letterElement.classList.contains('incorrect')) {
            letterElement.classList.remove('incorrect');
            letterElement.classList.add('passed'); // Tercer clic: Pasa la letra
        } else if (letterElement.classList.contains('passed')) {
            letterElement.classList.remove('passed'); // Cuarto clic: Vuelve al estado por defecto
            // O podrías decidir que "pasado" es un estado final
        } else {
            letterElement.classList.add('correct'); // Primer clic: se marca como correcta
        }

        console.log(`marcarLetra para ${letterElement}: ${getStatusClass(letterElement)}`);
        marcarLetra(char, getStatusClass(letterElement))
    }

    function getStatusClass(element) {
        const classes = element.classList; // Get all classes as a DOMTokenList
        const possibleStatusClasses = ['correct', 'incorrect', 'passed'];

        for (const className of classes) {
            if (className !== 'letter' && possibleStatusClasses.includes(className)) {
            return className; // Found the status class
            }
        }

        // If we reach here, no 'correct', 'incorrect', or 'passed' class was found
        return '';
    }

    // --- Timer y Control del Juego ---

    /* function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } */

    function updateTimerDisplay() {
    // Calcula las horas restantes
    const hours = Math.floor(timeRemaining / 3600); // 1 hora = 3600 segundos

    // Calcula los minutos restantes después de restar las horas
    const minutes = Math.floor((timeRemaining % 3600) / 60);

    // Calcula los segundos restantes después de restar horas y minutos
    const seconds = timeRemaining % 60;

    // Formatea la salida para incluir horas, minutos y segundos
    // padStart(2, '0') asegura que siempre tenga dos dígitos (ej. 05 en lugar de 5)
    timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

    function toggleTimer() {
        if (gameOver) { // Si el juego ya terminó, no se puede iniciar/pausar
            console.log("El juego ya ha terminado. Reinicia para jugar de nuevo.");
            return;
        }

        if (!gameStarted) {
            gameStarted = true;
            toggleTimerButton.textContent = 'Pausar';
            startTimer();
        } else if (isTimerRunning) {
            pauseTimer();
            toggleTimerButton.textContent = 'Reanudar';
        } else {
            startTimer();
            toggleTimerButton.textContent = 'Pausar';
        }

        estadoJuego = {
            ...estadoJuego,
            textTimerButton: toggleTimerButton.textContent
        }
        guardarConfiguracion()
}

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) { // El timer se detiene EXACTAMENTE en 0
                clearInterval(timerInterval);
                timerInterval = null;
                isTimerRunning = false;
                gameOver = true; // El juego ha terminado
                timerDisplay.textContent = '00:00:00'; // Asegura que muestre 00:00
                toggleTimerButton.textContent = 'Game Over';
                toggleTimerButton.disabled = true; // Deshabilita el botón de iniciar/pausar
                //restartGameButton.style.display = 'block'; // Muestra el botón de reiniciar
                //endGame();
                estadoJuego = { 
                    ...estadoJuego,
                    tiempoRestante: 0,
                    textTimerButton: 'Game Over',
                    disabledTimerButton: true
                }
                guardarConfiguracion()
            }
            estadoJuego = { 
                ...estadoJuego,
                tiempoRestante: timeRemaining,
            }
            guardarConfiguracion()
        }, 1000);
        isTimerRunning = true;
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;
    }

    function resetGame() {
        pauseTimer();
        timeRemaining = initialTimeInSeconds;
        updateTimerDisplay();
        gameStarted = false;
        gameOver = false; // Resetear el estado de "Game Over"
        toggleTimerButton.textContent = 'Comenzar';
        toggleTimerButton.disabled = false;
        //restartGameButton.style.display = 'none'; // Ocultar el botón de reiniciar
        //toogleInnerContent(true)

        roscoContainer.querySelectorAll('.letter').forEach(letter => {
            letter.classList.remove('correct', 'incorrect');
        });

        estadoJuego = {
            ...estadoJuego,
            currentLetters: currentLetters.map(objeto => ({
                ...objeto,
                state: '',
                anwsered: ''
            })),
            tiempoRestante: initialTimeInSeconds,
            aciertos: 0,
            fallos:0,
            textTimerButton: 'Comenzar',
            disabledTimerButton: false
        }
        guardarConfiguracion()

        createRosco(); // Recrear el rosco con las letras actuales

        cargarConfiguracion()
    }

    function endGame() {
        alert('¡El juego ha terminado! Tu tiempo se agotó.');
        // Puedes mostrar estadísticas o un mensaje más elaborado aquí.
    }

    function toogleInnerContent() {
        if (!innerContentShowed) {
            innerContent.style.display = "flex"
            moveGameButton.style.display = "flex"
            customizeButton.style.display = "flex"
            toggleGameButton.querySelector('span').textContent = 'visibility_off'
            innerContentShowed = true;
        } else {
            innerContent.style.display = "none"
            moveGameButton.style.display = "none"
            customizeButton.style.display = "none"
            toggleGameButton.querySelector('span').textContent = 'visibility'
            innerContentShowed = false;
        }
    }
    function moveInnerContent() {
        if (gameContainerMoved) {
            roscoContainer.appendChild(innerContent)
            moveGameButton.querySelector('span').textContent = 'right_panel_close'
            gameContainerMoved = false;
        } else {
            gameContainer.appendChild(innerContent)
            moveGameButton.querySelector('span').textContent = 'bottom_panel_close'
            gameContainerMoved = true;
        }
    }

    // --- Funciones del Modal de Personalización ---

    function openCustomizeModal() {
        // Rellenar los campos con la configuración actual
        gameTitleInput.value = gameTitle; // Rellenar el título actual
        /* lettersInput.value = currentLetters.map(item => `${item.char},${item.question},${item.answer}`).join('\n'); */
        lettersInput.value = currentLetters.map(item => `${item.char}`).join(',');
        timerInput.value = initialTimeInSeconds;

        customizeModal.style.display = 'flex';
        // Asegurarse de que el modal se puede desplazar si es necesario
        document.body.style.overflow = 'hidden'; // Evitar scroll del body cuando el modal está abierto
        document.documentElement.style.overflow = 'hidden'; // ¡NUEVA LÍNEA CLAVE!
    }

    function closeCustomizeModal() {
        customizeModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll del body
        document.documentElement.style.overflow = ''; // ¡NUEVA LÍNEA CLAVE!
    }

    function marcarLetra(letra, nuevoEstado) {
        const index = estadoJuego.currentLetters.findIndex(l => l.char === letra);
        if (index !== -1) {
            estadoJuego.currentLetters[index].state = nuevoEstado;
            /* if (nuevoEstado === 'correct') estadoJuego.aciertos++;
            if (nuevoEstado === 'incorrect') estadoJuego.fallos++; */
            estadoJuego.aciertos = 0;
            estadoJuego.fallos = 0;
            estadoJuego.currentLetters.forEach(letter => {
                if (letter.state === 'correct') {
                    estadoJuego.aciertos++;
                } else if (letter.state === 'incorrect') {
                    estadoJuego.fallos++;
                }
                // No hacemos nada si el estado es 'pased' o cualquier otro, según tu requerimiento
            });
            estadoJuego.tiempoRestante = timeRemaining;
            
            /* estadoJuego = { 
                ...estadoJuego,
                currentLetters: currentLetters.map(objeto => ({
                    ...objeto,
                    state: currentLettersnuevoEstado,
                    anwsered: ''
                })),
                tiempoRestante: initialTimeInSeconds - timeRemaining,
                aciertos: 0,
                fallos: 0,
            } */
            
            actualizarUIConEstado(estadoJuego); // Actualiza la UI inmediatamente
            guardarConfiguracion(); // Guarda el estado después de cada cambio
            console.log('marcarLetra', estadoJuego)
        }
    }
    
    function guardarConfiguracion() {     
        // Convierte tu objeto de estado del juego a una cadena JSON
        const estadoJuegoJSON = JSON.stringify(estadoJuego);

        // Guarda la cadena JSON en localStorage bajo una clave específica
        // La clave 'pasapalabra_config' es un ejemplo, puedes usar la que quieras
        localStorage.setItem('pasapalabra_config', estadoJuegoJSON);

        console.log('Configuración guardada en localStorage.');
    }

    function cargarConfiguracion() {
        // Intenta obtener la cadena JSON del localStorage
        const estadoGuardadoJSON = localStorage.getItem('pasapalabra_config');

        if (estadoGuardadoJSON) {
            try {
                // Si hay datos, conviértelos de nuevo a un objeto JavaScript
                estadoJuego = JSON.parse(estadoGuardadoJSON);
                console.log('Configuración cargada de localStorage:', estadoJuego);

                // Ahora, debes usar este 'estadoJuego' cargado para actualizar la UI de tu rosco
                // Por ejemplo, recorrer el array 'estadoJuego.letras' y aplicar los colores
                // y estados guardados a tus elementos HTML del rosco.
                actualizarUIConEstado(estadoJuego); // Función que tendrás que crear/adaptar
                return true; // Indica que se cargó algo
            } catch (e) {
                console.error('Error al parsear el JSON de la configuración guardada:', e);
                return false;
            }
        } else {
            console.log('No se encontró configuración guardada en localStorage.');
            return false; // Indica que no había nada que cargar
        }
    }

    // Ejemplo de cómo podría ser 'actualizarUIConEstado'
    function actualizarUIConEstado(estado) {
        estado.currentLetters.forEach((item, index) => {
            const elementoLetra = document.getElementById(`letter-${item.char.toLowerCase().replace(/[^a-z0-9]/g, '')}-${index}`); // Asume IDs como 'letra-A-0', 'letra-B-1'
            if (elementoLetra && item.state !== '') {
                // Elimina clases de estado previas y añade la nueva
                elementoLetra.classList.remove('correct', 'incorrect', 'passed');
                elementoLetra.classList.add(item.state);

                // Puedes también mostrar la respuesta si es relevante
                // elementoLetra.textContent = item.respondida || item.letra;
                //console.log(elementoLetra, item.state)
            }
        });
        // Actualizar el tiempo, aciertos, fallos en la UI
        // document.getElementById('tiempo').textContent = estado.tiempoRestante;
        // document.getElementById('aciertos').textContent = estado.aciertos;
        // document.getElementById('fallos').textContent = estado.fallos;
        gameTitle = estado.gameTitle;
        gameTitleDisplay.textContent = estado.gameTitle;
        initialTimeInSeconds = estado.initialTimeInSeconds;
        timeRemaining = estadoJuego.tiempoRestante;
        updateTimerDisplay();
        successText.textContent = `Aciertos: ${estadoJuego.aciertos}`;
        failureText.textContent = `Fallos: ${estadoJuego.fallos}`;
        toggleTimerButton.textContent = estado.textTimerButton;
        toggleTimerButton.disabled = estado.disabledTimerButton;
    }

    function saveSettings() {
        // 1. Guardar el Título del Juego
        const newGameTitle = gameTitleInput.value.trim();
        if (newGameTitle) {
            gameTitle = newGameTitle;
            gameTitleDisplay.textContent = gameTitle; // Actualizar el título en la UI principal
        } else {
            alert('El título del juego no puede estar vacío. Usando el título actual.');
        }

        // 2. Guardar la lista de elementos del rosco
        const newLettersText = lettersInput.value.trim();
        const parsedLetters = [];
        if (newLettersText) {
            /* newLettersText.split('\n').forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 3) {
                    const char = parts[0].trim();
                    const question = parts[1].trim();
                    const answer = parts.slice(2).join(',').trim();

                    if (char) {
                        parsedLetters.push({ char, question, answer });
                    }
                } else if (parts.length === 1 && parts[0].trim()) {
                    const char = parts[0].trim();
                    parsedLetters.push({ char, question: `Con ${char}: Sin pregunta definida.`, answer: 'N/A' });
                }
            }); */
            newLettersText.split(/[,|\r\n]+/).filter(Boolean).forEach(item => {
                const char = item.trim()
                parsedLetters.push({ char, question: `Con ${char}: Sin pregunta definida.`, answer: 'N/A' })
            })
        }

        if (parsedLetters.length > 0) {
            currentLetters = parsedLetters;
        } else {
            alert('La lista de elementos del rosco está vacía o es inválida. Usando la configuración actual.');
        }

        // 3. Guardar el tiempo del timer
        const newTime = parseInt(timerInput.value, 10);
        if (!isNaN(newTime) && newTime > 0 && newTime < 360000) {
            initialTimeInSeconds = newTime;
        } else {
            alert('El tiempo del timer es inválido (debe ser un número mayor a 0 y menor a 360000). Usando la configuración actual.');
        }

        estadoJuego = { 
            ...estadoJuego,
            gameTitle: gameTitle,
            initialTimeInSeconds: initialTimeInSeconds,
            currentLetters: currentLetters.map(objeto => ({
                ...objeto,
                state: '',
                anwsered: ''
            })),
        }

        guardarConfiguracion();
        closeCustomizeModal();
        resetGame(); // Reiniciar el juego con la nueva configuración
    }

    // --- Inicialización y Event Listeners ---

    // Establecer las letras iniciales y el título (si no hay personalización guardada)
    /* currentLetters = [
        { char: 'A', question: 'Con la A: Animal doméstico que maúlla.', answer: 'Gato' },
        { char: 'B', question: 'Con la B: Recipiente para beber.', answer: 'Botella' },
        { char: 'C', question: 'Con la C: Elemento químico, metal plateado, dúctil y maleable.', answer: 'Cobre' },
        { char: 'D', question: 'Con la D: Herramienta para perforar.', answer: 'Taladro' },
        { char: 'E', question: 'Con la E: Color de la esmeralda.', answer: 'Verde' },
        { char: 'F', question: 'Con la F: Estación del año antes del invierno.', answer: 'Otoño' },
        { char: 'G', question: 'Con la G: Cereal de grano redondo y blanco.', answer: 'Arroz' },
        { char: 'H', question: 'Con la H: Sinónimo de hogar.', answer: 'Casa' },
        { char: 'I', question: 'Con la I: Instrumento musical de cuerda.', answer: 'Guitarra' },
        { char: 'J', question: 'Con la J: Pieza de vestir de tela vaquera.', answer: 'Jeans' },
        { char: 'K', question: 'With K: A common fruit.', answer: 'Kiwi' },
        { char: 'L', question: 'Con la L: Sinónimo de veloz.', answer: 'Rápido' },
        { char: 'M', question: 'Con la M: Nombre de un mes de primavera.', answer: 'Mayo' },
        { char: 'N', question: 'Con la N: Número impar que sigue al ocho.', answer: 'Nueve' },
        { char: 'Ñ', question: 'Con la Ñ: Animal grande con cuernos que vive en la selva.', answer: 'Ñu' },
        { char: 'O', question: 'Con la O: Planeta más cercano al sol.', answer: 'Mercurio' },
        { char: 'P', question: 'Con la P: Líquido que beben las plantas.', answer: 'Agua' },
        { char: 'Q', question: 'Con la Q: Utensilio de cocina para cortar.', answer: 'Cuchillo' },
        { char: 'R', question: 'Con la R: Sinónimo de obsequio.', answer: 'Regalo' },
        { char: 'S', question: 'Con la S: Astro que ilumina de día.', answer: 'Sol' },
        { char: 'T', question: 'Con la T: Vehículo de transporte público de pasajeros.', answer: 'Tren' },
        { char: 'U', question: 'Con la U: Fruta pequeña, redonda y dulce, que crece en racimos.', answer: 'Uva' },
        { char: 'V', question: 'Con la V: Nombre de un sentido.', answer: 'Vista' },
        { char: 'W', question: 'With W: A type of animal.', answer: 'Wolf' },
        { char: 'X', question: 'With X: Musical instrument.', answer: 'Xylophone' },
        { char: 'Y', question: 'With Y: A color.', answer: 'Yellow' },
        { char: 'Z', question: 'With Z: An animal with stripes.', answer: 'Zebra' }
    ];
    gameTitleDisplay.textContent = gameTitle; // Asegurar que el título inicial se muestre
    updateTimerDisplay(); // Mostrar el tiempo inicial al cargar */

    toggleTimerButton.addEventListener('click', toggleTimer);
    customizeButton.addEventListener('click', openCustomizeModal);
    closeModalButton.addEventListener('click', closeCustomizeModal);
    saveSettingsButton.addEventListener('click', saveSettings);
    restartGameButton.addEventListener('click', resetGame); // Event listener para el botón de reiniciar
    toggleGameButton.addEventListener('click', toogleInnerContent);
    moveGameButton.addEventListener('click', moveInnerContent);
/*     document.window.addEventListener('resize', moveInnerContent); */

    // Cerrar el modal al hacer clic fuera de su contenido
    window.addEventListener('click', (event) => {
        if (event.target === customizeModal) {
            closeCustomizeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && customizeModal.style.display === 'flex') { // O como verifiques si tu modal está abierto
            closeCustomizeModal();
        }
    });

    /* Removido por que tengo un text area y el salto de linea con el enter provoca incongruencias */
    /* document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && customizeModal.style.display === 'flex') { // O como verifiques si tu modal está abierto
            saveSettings()
        }
    }); */

    createRosco(); // Crea el rosco inicial
    cargarConfiguracion();

    // Recalcular el rosco si la ventana cambia de tamaño
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createRosco();
            cargarConfiguracion();
        }, 250);
    });

    window.addEventListener('storage', (event) => {
    // Comprueba si la clave que te interesa ha cambiado
    if (event.key === 'pasapalabra_config') {
        console.log('Detectado cambio en localStorage:', event.newValue);
        if (event.newValue) {
            try {
                // Parsear el nuevo valor y actualizar el estado de tu juego
                const nuevoEstadoJuego = JSON.parse(event.newValue);
                estadoJuego = nuevoEstadoJuego; // Actualiza tu variable global de estado
                createRosco()
                actualizarUIConEstado(estadoJuego); // Función para refrescar la interfaz
                console.log('Estado del juego actualizado desde otra pestaña.');
            } catch (e) {
                console.error('Error al parsear el nuevo estado de localStorage:', e);
            }
        } else {
            // El valor fue borrado (ej. localStorage.removeItem('pasapalabra_config'))
            console.log('Configuración de Pasapalabra borrada en otra pestaña.');
            // Puedes reiniciar el juego o mostrar un mensaje
        }
    }
});

});
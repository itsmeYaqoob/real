document.addEventListener('DOMContentLoaded', () => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }

    const exercises = [
        {
            id: 1,
            title: "Glute Step-Ups",
            reps: "10 (per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/8Qj8n9T.gif",
            instructions: `
                <ol>
                    <li>Stand facing a knee-level platform (chair, bench).</li>
                    <li>Place one foot firmly on it. Lift the toes of your back foot off the ground.</li>
                    <li>Drive through your front heel to lift your body up until your front leg is extended.</li>
                    <li>Slowly lower yourself back down with control.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
        {
            id: 2,
            title: "Lunge Kickbacks",
            reps: "15 (per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/K4z3r8E.gif",
            instructions: `
                <ol>
                    <li>Stand a couple feet from a low, mid-shin height platform. Place one foot on it.</li>
                    <li>Lower into a lunge, dropping your back knee towards the floor.</li>
                    <li>Press through your front foot to return to standing.</li>
                    <li>From the top, kick your back leg straight behind you, squeezing the glute.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
        {
            id: 3,
            title: "Squats (No Lockout)",
            reps: "20",
            sets: "2-3",
            gif: "https://i.imgur.com/HnUjQ5H.gif",
            instructions: `
                <ol>
                    <li>Stand with feet slightly wider than shoulder-width, toes pointing slightly out.</li>
                    <li>Lower down slowly (3-second count) until your hips are at least parallel with your knees.</li>
                    <li>Drive back up but stop before fully locking your knees to maintain tension.</li>
                    <li>Immediately begin the next rep.</li>
                </ol>`
        },
        {
            id: 4,
            title: "Isometric Hip Abduction",
            reps: "15",
            sets: "2-3",
            gif: "https://i.imgur.com/gK2Jz8E.gif",
            instructions: `
                <ol>
                    <li>Lower into a squat position, with thighs parallel to the ground.</li>
                    <li>Hold this low squat position.</li>
                    <li>While holding, flare both knees outward, squeezing your glutes.</li>
                    <li>Bring your knees back to the starting width and repeat the flaring motion.</li>
                </ol>`
        },
        {
            id: 5,
            title: "Lateral Lunges",
            reps: "15 (per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/lOQzK7d.gif",
            instructions: `
                <ol>
                    <li>Stand with feet together. Take a large step out to one side.</li>
                    <li>Keep both feet pointed forward, shift your hips back, and bend your knee to lower down. Keep the other leg straight.</li>
                    <li>Push off your lunging foot to return to the starting position.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
        {
            id: 6,
            title: "Single Leg Bridges",
            reps: "10 (per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/P5d9v3f.gif",
            instructions: `
                <ol>
                    <li>Lie on your back. Bend one knee and plant that foot on the ground.</li>
                    <li>Cross your other ankle over the bent knee.</li>
                    <li>Drive your foot into the ground to lift your hips up, squeezing your glutes hard at the top.</li>
                    <li>Hold for a second, then slowly lower down.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
        {
            id: 7,
            title: "Bulgarian Split Squats",
            reps: "15 (per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/kS9yJjR.gif",
            instructions: `
                <ol>
                    <li>Stand 2-3 feet in front of a knee-height platform.</li>
                    <li>Place the top of one foot on the platform behind you.</li>
                    <li>Lower yourself straight down until your front thigh is about parallel to the floor.</li>
                    <li>Drive through your front foot to press back up.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
        {
            id: 8,
            title: "Frog Pumps",
            reps: "15",
            sets: "2-3",
            gif: "https://i.imgur.com/5u9b2bZ.gif",
            instructions: `
                <ol>
                    <li>Lie with your upper back on a platform or on the ground.</li>
                    <li>Place the bottoms of your feet together, letting your knees fall out to the sides.</li>
                    <li>Drive through the outside edges of your feet to lift your hips, squeezing your glutes at the top.</li>
                    <li>Lower back down and repeat.</li>
                </ol>`
        },
        {
            id: 9,
            title: "Donkey Kick/Fire Hydrant",
            reps: "10 (combos per side)",
            sets: "2-3",
            gif: "https://i.imgur.com/D4sT1wR.gif",
            instructions: `
                <ol>
                    <li>Start on all fours with a flat back and tight core.</li>
                    <li>Perform one Donkey Kick by kicking one leg back and up.</li>
                    <li>Immediately perform one Fire Hydrant by lifting the same leg out to the side.</li>
                    <li>This combo is one rep. Go back and forth between the two moves.</li>
                    <li>Complete all reps on one side before switching.</li>
                </ol>`
        },
    ];

    const mainContent = document.getElementById('main-content');
    const modal = document.getElementById('exercise-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const completeExerciseBtn = document.getElementById('complete-exercise-btn');
    const resetProgressBtn = document.getElementById('reset-progress');
    let currentExerciseId = null;

    // Progress tracking with localStorage
    let progress = JSON.parse(localStorage.getItem('gluteProgress')) || {};
    const today = new Date().toISOString().slice(0, 10);

    // Clear progress if it's a new day
    if (progress.date !== today) {
        progress = { date: today, completed: {} };
        localStorage.setItem('gluteProgress', JSON.stringify(progress));
    }
    
    function renderExercises() {
        mainContent.innerHTML = '';
        exercises.forEach(exercise => {
            const isCompleted = progress.completed[exercise.id];
            const card = document.createElement('div');
            card.className = `exercise-card ${isCompleted ? 'completed' : ''}`;
            card.dataset.id = exercise.id;
            
            card.innerHTML = `
                <div class="exercise-number">#${String(exercise.id).padStart(2, '0')}</div>
                <div class="exercise-info">
                    <h3 class="exercise-title">${exercise.title}</h3>
                    <div class="exercise-details">${exercise.reps} &bull; ${exercise.sets} Sets</div>
                </div>
                <div class="completion-check">✔</div>
            `;
            
            card.addEventListener('click', () => openModal(exercise.id));
            mainContent.appendChild(card);
        });
    }

    function openModal(id) {
        const exercise = exercises.find(ex => ex.id === id);
        if (!exercise) return;

        currentExerciseId = id;
        document.getElementById('modal-title').textContent = exercise.title;
        document.getElementById('modal-gif').src = exercise.gif;
        document.getElementById('modal-reps').textContent = exercise.reps;
        document.getElementById('modal-sets').textContent = exercise.sets;
        document.getElementById('modal-instructions').innerHTML = exercise.instructions;
        
        modal.classList.remove('hidden');
        resetTimer();
    }

    function closeModal() {
        modal.classList.add('hidden');
        currentExerciseId = null;
    }

    function completeExercise() {
        if (currentExerciseId) {
            progress.completed[currentExerciseId] = true;
            localStorage.setItem('gluteProgress', JSON.stringify(progress));
            renderExercises();
            closeModal();
        }
    }
    
    resetProgressBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to reset your progress for today?')) {
            progress.completed = {};
            localStorage.setItem('gluteProgress', JSON.stringify(progress));
            renderExercises();
        }
    });

    // Timer Logic
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer-btn');
    let timerInterval;
    const REST_TIME = 90;

    function resetTimer() {
        clearInterval(timerInterval);
        timerDisplay.textContent = REST_TIME;
        startTimerBtn.disabled = false;
    }

    startTimerBtn.addEventListener('click', () => {
        startTimerBtn.disabled = true;
        let timeLeft = REST_TIME;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Rest is over! Time for the next set.");
                resetTimer();
            }
        }, 1000);
    });

    closeModalBtn.addEventListener('click', closeModal);
    completeExerciseBtn.addEventListener('click', completeExercise);

    renderExercises();
});
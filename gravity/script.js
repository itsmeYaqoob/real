// Gravity Glutes App - JavaScript
class GravityGlutesApp {
    constructor() {
        this.currentTab = 'workouts';
        this.timer = null;
        this.timerDuration = 30;
        this.timeRemaining = 30;
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        this.workoutData = this.loadWorkoutData();
        
        this.exercises = {
            'squats': {
                name: 'Squats',
                icon: '🏋️',
                sets: 3,
                reps: 15,
                description: 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, keeping your chest up and knees behind your toes. Push through your heels to return to start.',
                difficulty: 'beginner'
            },
            'lunges': {
                name: 'Lunges',
                icon: '🚶',
                sets: 3,
                reps: '12 each leg',
                description: 'Step forward with one leg, lowering your hips until both knees are bent at 90 degrees. Push back to starting position and repeat with other leg.',
                difficulty: 'intermediate'
            },
            'hip-thrusts': {
                name: 'Hip Thrusts',
                icon: '⬆️',
                sets: 4,
                reps: 20,
                description: 'Lie on your back with knees bent. Lift your hips up, squeezing your glutes at the top. Lower back down with control.',
                difficulty: 'intermediate'
            },
            'glute-bridges': {
                name: 'Glute Bridges',
                icon: '🌉',
                sets: 3,
                reps: 25,
                description: 'Similar to hip thrusts but performed on the floor. Focus on squeezing glutes and maintaining a straight line from knees to shoulders.',
                difficulty: 'beginner'
            },
            'bulgarian-split-squats': {
                name: 'Bulgarian Split Squats',
                icon: '🏃',
                sets: 3,
                reps: '10 each leg',
                description: 'Place rear foot on a bench behind you. Lower into a lunge position, keeping most weight on front leg. Push back up to start.',
                difficulty: 'advanced'
            },
            'deadlifts': {
                name: 'Romanian Deadlifts',
                icon: '💪',
                sets: 4,
                reps: 12,
                description: 'Hold weights in front of thighs. Hinge at hips, pushing them back while keeping chest up. Lower weights along legs, then drive hips forward to return.',
                difficulty: 'advanced'
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateProgressStats();
        this.updateTimer();
    }
    
    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Workout cards
        document.querySelectorAll('.workout-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const exercise = e.currentTarget.dataset.exercise;
                this.showExerciseModal(exercise);
            });
        });
        
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetTimer());
        
        // Timer presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTimerDuration(parseInt(e.target.dataset.time));
            });
        });
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('startExercise').addEventListener('click', () => this.startExercise());
        document.getElementById('markComplete').addEventListener('click', () => this.markExerciseComplete());
        
        // FAB
        document.getElementById('startWorkout').addEventListener('click', () => this.startRandomWorkout());
        
        // Close modal on outside click
        document.getElementById('workoutModal').addEventListener('click', (e) => {
            if (e.target.id === 'workoutModal') {
                this.closeModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Update progress when switching to progress tab
        if (tabName === 'progress') {
            this.updateProgressStats();
        }
    }
    
    showExerciseModal(exerciseKey) {
        const exercise = this.exercises[exerciseKey];
        if (!exercise) return;
        
        // Populate modal content
        document.getElementById('modalTitle').textContent = 'Exercise Details';
        document.getElementById('modalIcon').textContent = exercise.icon;
        document.getElementById('modalExercise').textContent = exercise.name;
        document.getElementById('modalDescription').textContent = exercise.description;
        document.getElementById('modalSets').textContent = exercise.sets;
        document.getElementById('modalReps').textContent = exercise.reps;
        
        // Store current exercise
        this.currentExercise = exerciseKey;
        
        // Show modal
        document.getElementById('workoutModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        document.getElementById('workoutModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentExercise = null;
    }
    
    startExercise() {
        if (this.currentExercise) {
            // Switch to timer tab and start a workout timer
            this.switchTab('timer');
            this.setTimerDuration(60); // Default workout rest time
            this.closeModal();
            
            // Show success message
            this.showToast(`Started ${this.exercises[this.currentExercise].name}!`);
        }
    }
    
    markExerciseComplete() {
        if (this.currentExercise) {
            // Update workout data
            this.workoutData.totalWorkouts++;
            this.workoutData.totalTime += 5; // Assume 5 minutes per exercise
            this.workoutData.lastWorkout = new Date().toISOString();
            this.saveWorkoutData();
            
            // Update UI
            this.updateProgressStats();
            this.closeModal();
            
            // Show success message
            this.showToast(`Great job completing ${this.exercises[this.currentExercise].name}! 💪`);
        }
    }
    
    startRandomWorkout() {
        const exerciseKeys = Object.keys(this.exercises);
        const randomExercise = exerciseKeys[Math.floor(Math.random() * exerciseKeys.length)];
        this.showExerciseModal(randomExercise);
    }
    
    // Timer Methods
    startTimer() {
        if (this.isTimerPaused) {
            this.isTimerPaused = false;
        } else {
            this.timeRemaining = this.timerDuration;
        }
        
        this.isTimerRunning = true;
        this.updateTimerButtons();
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimer();
            
            if (this.timeRemaining <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isTimerRunning = false;
        this.isTimerPaused = true;
        clearInterval(this.timer);
        this.updateTimerButtons();
    }
    
    resetTimer() {
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        this.timeRemaining = this.timerDuration;
        clearInterval(this.timer);
        this.updateTimer();
        this.updateTimerButtons();
    }
    
    setTimerDuration(seconds) {
        this.timerDuration = seconds;
        if (!this.isTimerRunning) {
            this.timeRemaining = seconds;
            this.updateTimer();
        }
        
        // Update active preset button
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === seconds) {
                btn.classList.add('active');
            }
        });
    }
    
    updateTimer() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timeDisplay').textContent = display;
    }
    
    updateTimerButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');
        
        if (this.isTimerRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
        
        resetBtn.disabled = false;
    }
    
    timerComplete() {
        this.isTimerRunning = false;
        this.isTimerPaused = false;
        clearInterval(this.timer);
        
        // Play notification sound (if supported)
        this.playNotificationSound();
        
        // Show notification
        this.showToast('⏰ Timer completed! Time for your next set!');
        
        // Reset timer
        this.timeRemaining = this.timerDuration;
        this.updateTimer();
        this.updateTimerButtons();
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    }
    
    // Progress Methods
    updateProgressStats() {
        document.getElementById('totalWorkouts').textContent = this.workoutData.totalWorkouts;
        document.getElementById('currentStreak').textContent = this.calculateStreak();
        document.getElementById('totalTime').textContent = this.workoutData.totalTime;
        
        this.updateWeeklyChart();
    }
    
    calculateStreak() {
        if (!this.workoutData.lastWorkout) return 0;
        
        const lastWorkout = new Date(this.workoutData.lastWorkout);
        const today = new Date();
        const diffTime = Math.abs(today - lastWorkout);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 1 ? this.workoutData.currentStreak : 0;
    }
    
    updateWeeklyChart() {
        // Simulate weekly data - in a real app, this would come from stored data
        const weeklyData = [20, 40, 60, 30, 80, 50, 70];
        const bars = document.querySelectorAll('.chart-bar');
        
        bars.forEach((bar, index) => {
            bar.style.height = weeklyData[index] + '%';
            bar.style.animationDelay = (index * 0.1) + 's';
        });
    }
    
    // Data Persistence
    loadWorkoutData() {
        const defaultData = {
            totalWorkouts: 0,
            totalTime: 0,
            currentStreak: 0,
            lastWorkout: null,
            exerciseHistory: []
        };
        
        try {
            const saved = localStorage.getItem('gravityGlutesData');
            return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
        } catch (e) {
            console.error('Error loading workout data:', e);
            return defaultData;
        }
    }
    
    saveWorkoutData() {
        try {
            localStorage.setItem('gravityGlutesData', JSON.stringify(this.workoutData));
        } catch (e) {
            console.error('Error saving workout data:', e);
        }
    }
    
    // Utility Methods
    showToast(message) {
        // Create and show a toast notification
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 3000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        `;
        
        // Add CSS animation
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    // Install PWA prompt
    handleInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button or prompt
            this.showInstallPrompt(deferredPrompt);
        });
        
        window.addEventListener('appinstalled', () => {
            this.showToast('App installed successfully! 🎉');
            deferredPrompt = null;
        });
    }
    
    showInstallPrompt(deferredPrompt) {
        // You could show a custom install prompt here
        console.log('PWA install prompt available');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new GravityGlutesApp();
    
    // Handle install prompt
    app.handleInstallPrompt();
    
    // Add some initial sample data for demo purposes
    if (app.workoutData.totalWorkouts === 0) {
        app.workoutData.totalWorkouts = 12;
        app.workoutData.totalTime = 150;
        app.workoutData.currentStreak = 3;
        app.saveWorkoutData();
        app.updateProgressStats();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
});

// Prevent zoom on iOS Safari
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

// Handle viewport height changes (mobile browsers)
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
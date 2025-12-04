/**
 * Study Hub - Learning Dashboard JavaScript
 * 
 * This file contains all the interactive functionality for the study dashboard:
 * 1. Tutorial management and timer functionality
 * 2. To-do list management with localStorage persistence
 * 3. Dark/Light mode toggle
 * 4. Responsive behaviors
 * 
 * Instructions for customization:
 * - To add your own tutorials: Edit the 'tutorials' array below
 * - To modify timer duration: Change TIMER_DURATION constant
 * - To add new task categories: Edit the category dropdown in HTML
 */

// ===== CONSTANTS & CONFIGURATION =====
const TIMER_DURATION = 30 * 60; // 30 minutes in seconds
const STORAGE_KEYS = {
    TASKS: 'studyHub_tasks',
    THEME: 'studyHub_theme',
    CURRENT_FILTER: 'studyHub_filter'
};

// ===== TUTORIALS DATA =====
// Your actual study materials - easily add more by adding new objects to this array
const tutorials = [
    {
        id: 1,
        title: "React Official Documentation",
        description: "Learn React from the ground up with the official interactive tutorial and comprehensive guides.",
        tag: "React",
        url: "https://react.dev/learn",
        visible: true
    },
    {
        id: 2,
        title: "Mostly Adequate Guide to Functional Programming",
        description: "A comprehensive guide to functional programming concepts in JavaScript with practical examples.",
        tag: "JavaScript",
        url: "https://mostly-adequate.gitbook.io/mostly-adequate-guide",
        visible: true
    },
    {
        id: 3,
        title: "Next.js Learn Course",
        description: "Build full-stack web applications with Next.js through hands-on tutorials and real projects.",
        tag: "Next.js",
        url: "https://nextjs.org/learn",
        visible: true
    },
    {
        id: 4,
        title: "Tailwind CSS with Vite Setup",
        description: "Learn how to set up and use Tailwind CSS with Vite for rapid UI development.",
        tag: "CSS",
        url: "https://tailwindcss.com/docs/installation/using-vite",
        visible: true
    },
    {
        id: 5,
        title: "Supabase Documentation",
        description: "Complete guide to Supabase - the open source Firebase alternative for building apps.",
        tag: "Backend",
        url: "https://supabase.com/docs",
        visible: true
    },
    {
        id: 6,
        title: "PostgreSQL Tutorial",
        description: "Official PostgreSQL tutorial covering database fundamentals and advanced features.",
        tag: "Database",
        url: "http://postgresql.org/docs/current/tutorial.html",
        visible: true
    },
    {
        id: 7,
        title: "Web Scraping with Cheerio",
        description: "Learn web scraping techniques using Cheerio for server-side HTML parsing and manipulation.",
        tag: "Node.js",
        url: "https://wanago.io/2025/02/17/cheerio-web-scraping/",
        visible: true
    },
    {
        id: 8,
        title: "Playwright Testing Framework",
        description: "End-to-end testing for modern web apps with Playwright's powerful automation tools.",
        tag: "Testing",
        url: "https://playwright.dev/docs/intro",
        visible: true
    },
    // Hidden containers for future additions - set visible: false to hide them
    {
        id: 9,
        title: "90 day devops",
        description: "devops",
        tag: "Custom",
        url: "https://github.com/PranuPranav97/90DaysOfDevOps/blob/main/Days/day11.md",
        visible: true
    },
    {
        id: 10,
        title: "Empty Slot 2", 
        description: "Add another tutorial link here when needed.",
        tag: "Custom",
        url: "https://example.com",
        visible: false
    },
    {
        id: 11,
        title: "Empty Slot 3",
        description: "Reserved space for future learning resources.",
        tag: "Custom", 
        url: "https://example.com",
        visible: false
    },
    {
        id: 12,
        title: "Empty Slot 4",
        description: "Add more study materials as you discover them.",
        tag: "Custom",
        url: "https://example.com", 
        visible: false
    }
];

// ===== GLOBAL STATE =====
let currentTimer = null;
let timerInterval = null;
let isTimerRunning = false;
let isPaused = false;
let currentStudyItem = null;
let tasks = [];
let currentFilter = 'all';

// ===== DOM ELEMENTS =====
const elements = {
    // Theme toggle
    themeToggle: document.getElementById('themeToggle'),
    
    // Timer elements
    timerContainer: document.getElementById('timerContainer'),
    currentStudy: document.getElementById('currentStudy'),
    timerDisplay: document.getElementById('timerDisplay'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Tutorial elements
    tutorialsGrid: document.getElementById('tutorialsGrid'),
    
    // Task elements
    taskInput: document.getElementById('taskInput'),
    taskCategory: document.getElementById('taskCategory'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    tasksContainer: document.getElementById('tasksContainer'),
    
    // Modal elements
    modalOverlay: document.getElementById('modalOverlay'),
    modalOk: document.getElementById('modalOk')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadTheme();
    loadTasks();
    loadCurrentFilter();
    renderTutorials();
    renderTasks();
    setupEventListeners();
    resetTimer();
}

// ===== THEME MANAGEMENT =====
function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const theme = savedTheme || 'light';
    
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ===== TIMER FUNCTIONALITY =====
function startTimer(studyItem) {
    // Stop any existing timer
    stopTimer();
    
    // Set new study item and timer
    currentStudyItem = studyItem;
    currentTimer = TIMER_DURATION;
    isTimerRunning = true;
    isPaused = false;
    
    // Update UI
    updateTimerDisplay();
    updateCurrentStudy();
    enableTimerControls();
    
    // Open the tutorial link in new tab
    window.open(studyItem.url, '_blank');
    
    // Start the countdown
    timerInterval = setInterval(() => {
        if (!isPaused && currentTimer > 0) {
            currentTimer--;
            updateTimerDisplay();
            
            // Timer finished
            if (currentTimer <= 0) {
                onTimerComplete();
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;
    
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetTimer() {
    stopTimer();
    currentTimer = TIMER_DURATION;
    currentStudyItem = null;
    isTimerRunning = false;
    isPaused = false;
    
    updateTimerDisplay();
    updateCurrentStudy();
    disableTimerControls();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function onTimerComplete() {
    stopTimer();
    isTimerRunning = false;
    disableTimerControls();
    showTimerCompleteModal();
}

function updateTimerDisplay() {
    const minutes = Math.floor(currentTimer / 60);
    const seconds = currentTimer % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.timerDisplay.textContent = display;
}

function updateCurrentStudy() {
    if (currentStudyItem) {
        elements.currentStudy.textContent = `Currently studying: ${currentStudyItem.title}`;
    } else {
        elements.currentStudy.textContent = 'Ready to start studying';
    }
}

function enableTimerControls() {
    elements.pauseBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.pauseBtn.textContent = 'Pause';
}

function disableTimerControls() {
    elements.pauseBtn.disabled = true;
    elements.resetBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
}

function showTimerCompleteModal() {
    elements.modalOverlay.classList.add('show');
}

function hideTimerCompleteModal() {
    elements.modalOverlay.classList.remove('show');
}

// ===== TUTORIALS RENDERING =====
function renderTutorials() {
    elements.tutorialsGrid.innerHTML = '';
    
    // Only render visible tutorials
    const visibleTutorials = tutorials.filter(tutorial => tutorial.visible !== false);
    
    visibleTutorials.forEach(tutorial => {
        const card = createTutorialCard(tutorial);
        elements.tutorialsGrid.appendChild(card);
    });
}

function createTutorialCard(tutorial) {
    const card = document.createElement('div');
    card.className = 'tutorial-card';
    card.onclick = () => startTimer(tutorial);
    
    card.innerHTML = `
        <h3 class="tutorial-title">${tutorial.title}</h3>
        <p class="tutorial-description">${tutorial.description}</p>
        <span class="tutorial-tag">${tutorial.tag}</span>
    `;
    
    return card;
}

// ===== TASKS MANAGEMENT =====
function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function loadCurrentFilter() {
    currentFilter = localStorage.getItem(STORAGE_KEYS.CURRENT_FILTER) || 'all';
    updateFilterButtons();
}

function saveCurrentFilter() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_FILTER, currentFilter);
}

function addTask() {
    const text = elements.taskInput.value.trim();
    const category = elements.taskCategory.value;
    
    if (!text) return;
    
    const task = {
        id: Date.now(),
        text: text,
        category: category,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task); // Add to beginning of array
    saveTasks();
    
    // Clear form
    elements.taskInput.value = '';
    elements.taskCategory.value = '';
    
    renderTasks();
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

function filterTasks(filter) {
    currentFilter = filter;
    saveCurrentFilter();
    updateFilterButtons();
    renderTasks();
}

function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function renderTasks() {
    elements.tasksContainer.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'task-item';
        emptyState.innerHTML = `
            <p style="text-align: center; color: var(--text-muted); font-style: italic;">
                ${currentFilter === 'all' ? 'No tasks yet. Add one above!' : 
                  currentFilter === 'active' ? 'No active tasks.' : 'No completed tasks.'}
            </p>
        `;
        elements.tasksContainer.appendChild(emptyState);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        elements.tasksContainer.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    taskItem.innerHTML = `
        <div class="task-header">
            <input 
                type="checkbox" 
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTaskComplete(${task.id})"
            >
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
            </div>
        </div>
        <div class="task-meta">
            ${task.category ? `<span class="task-category">${escapeHtml(task.category)}</span>` : ''}
            <div class="task-actions">
                <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    return taskItem;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Timer controls
    elements.pauseBtn.addEventListener('click', pauseTimer);
    elements.resetBtn.addEventListener('click', resetTimer);
    
    // Task form
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            addTask();
        }
    });
    
    // Task filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
    });
    
    // Modal
    elements.modalOk.addEventListener('click', hideTimerCompleteModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            hideTimerCompleteModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    // Escape to close modal
    if (e.key === 'Escape' && elements.modalOverlay.classList.contains('show')) {
        hideTimerCompleteModal();
    }
    
    // Ctrl/Cmd + K to focus task input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.taskInput.focus();
    }
    
    // Space to pause/resume timer (when not typing)
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (isTimerRunning) {
            e.preventDefault();
            pauseTimer();
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== GLOBAL FUNCTIONS (called from HTML onclick handlers) =====
// These functions need to be global so they can be called from HTML onclick attributes
window.toggleTaskComplete = toggleTaskComplete;
window.deleteTask = deleteTask;

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce function for search/filter operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Study Hub Error:', e.error);
    // You could add user-friendly error reporting here
});

// ===== SERVICE WORKER REGISTRATION (for offline support) =====
// Uncomment this section if you want to add offline support later
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
*/

// ===== EXPORT FOR TESTING (if needed) =====
// For unit testing, you can export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addTask,
        toggleTaskComplete,
        deleteTask,
        filterTasks,
        startTimer,
        pauseTimer,
        resetTimer
    };
}

const STORAGE_KEY = 'habitos-ios-app';
const todayKey = new Date().toISOString().slice(0, 10);

function createId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultHabits = [
    { id: createId(), name: 'Tomar agua', streak: 3, completedDates: [] },
    { id: createId(), name: 'Leer 10 minutos', streak: 5, completedDates: [] },
    { id: createId(), name: 'Caminar', streak: 2, completedDates: [] }
];

const habitList = document.querySelector('#habitList');
const emptyState = document.querySelector('#emptyState');
const habitForm = document.querySelector('#habitForm');
const habitName = document.querySelector('#habitName');
const resetDay = document.querySelector('#resetDay');
const totalHabits = document.querySelector('#totalHabits');
const completedHabits = document.querySelector('#completedHabits');
const bestStreak = document.querySelector('#bestStreak');
const progressPercent = document.querySelector('#progressPercent');
const todayDate = document.querySelector('#todayDate');

let habits = loadHabits();

todayDate.textContent = new Intl.DateTimeFormat('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
}).format(new Date());

function loadHabits() {
    const savedHabits = localStorage.getItem(STORAGE_KEY);
    return savedHabits ? JSON.parse(savedHabits) : defaultHabits;
}

function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function isCompletedToday(habit) {
    return habit.completedDates.includes(todayKey);
}

function updateStreak(habit, completed) {
    if (completed) {
        habit.streak += 1;
        habit.completedDates.push(todayKey);
    } else {
        habit.streak = Math.max(0, habit.streak - 1);
        habit.completedDates = habit.completedDates.filter((date) => date !== todayKey);
    }
}

function renderHabits() {
    habitList.innerHTML = '';
    emptyState.hidden = habits.length > 0;

    habits.forEach((habit) => {
        const completed = isCompletedToday(habit);
        const item = document.createElement('article');
        item.className = `habit-item${completed ? ' habit-item--done' : ''}`;
        const checkButton = document.createElement('button');
        checkButton.className = 'check-button';
        checkButton.type = 'button';
        checkButton.setAttribute('aria-label', `Marcar ${habit.name} como ${completed ? 'pendiente' : 'completado'}`);
        checkButton.textContent = completed ? '✓' : '';

        const habitInfo = document.createElement('div');
        habitInfo.className = 'habit-info';

        const habitTitle = document.createElement('h3');
        habitTitle.textContent = habit.name;

        const habitStreak = document.createElement('p');
        habitStreak.textContent = `${habit.streak} días de racha`;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', `Eliminar ${habit.name}`);
        deleteButton.textContent = 'Eliminar';

        habitInfo.append(habitTitle, habitStreak);
        item.append(checkButton, habitInfo, deleteButton);

        checkButton.addEventListener('click', () => {
            updateStreak(habit, !completed);
            saveHabits();
            renderHabits();
        });

        deleteButton.addEventListener('click', () => {
            habits = habits.filter((currentHabit) => currentHabit.id !== habit.id);
            saveHabits();
            renderHabits();
        });

        habitList.appendChild(item);
    });

    updateStats();
}

function updateStats() {
    const completedToday = habits.filter(isCompletedToday).length;
    const percent = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;

    totalHabits.textContent = habits.length;
    completedHabits.textContent = completedToday;
    bestStreak.textContent = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
    progressPercent.textContent = `${percent}%`;
}

habitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = habitName.value.trim();

    if (!name) {
        return;
    }

    habits.unshift({
        id: createId(),
        name,
        streak: 0,
        completedDates: []
    });

    habitName.value = '';
    saveHabits();
    renderHabits();
});

resetDay.addEventListener('click', () => {
    habits = habits.map((habit) => ({
        ...habit,
        completedDates: habit.completedDates.filter((date) => date !== todayKey)
    }));
    saveHabits();
    renderHabits();
});

renderHabits();

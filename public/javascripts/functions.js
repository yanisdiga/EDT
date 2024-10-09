import { displayContainer, hours, btnFirstWeek, btnSecondWeek, btnThirdWeek, lessonTitles, lessonsContainer } from './domElements.js';
//import { setLessonColor, createLessonContainer, getColumnByDay } from './utils.js';
import { oneJan, weekNumber, year, edtURL, hajarColor, setWeekNumber } from './utils.js'

function removeLessons() {
    const lessons = document.querySelectorAll('.lesson');
    const emptyDayContainers = document.querySelectorAll('.empty-day-container');
    const vacationContainer = document.querySelector('.vacation-container');
    lessons.forEach((lesson) => {
        lesson.remove();
    });
    emptyDayContainers.forEach((container) => {
        container.remove();
    });
    if (vacationContainer) vacationContainer.remove();
}

//onst url = 'https://corsproxy.io/?' + encodeURIComponent(edtURL);
export async function edtLoad() {
    removeLessons();
    try {
        const response = await fetch(edtURL);
        const data = await response.text();
        const vevents = new ICAL.Component(ICAL.parse(data)).getAllSubcomponents('vevent');

        const startOfWeek = new Date(oneJan);
        startOfWeek.setDate(oneJan.getDate() + (weekNumber - 1) * 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const lessonElements = [];

        vevents.forEach((vevent) => {
            const dateStart = new Date(vevent.getFirstPropertyValue('dtstart'));
            const dateEnd = new Date(vevent.getFirstPropertyValue('dtend'));

            if (dateStart >= startOfWeek && dateEnd <= endOfWeek) {
                const summary = vevent.getFirstPropertyValue('summary');
                const offset = (weekNumber >= 44 || weekNumber <= 13) ? 1 : 2;
                [dateStart, dateEnd].forEach(date => date.setHours(date.getHours() + offset));

                const dayOfWeek = dateStart.toLocaleDateString("fr-FR", { weekday: "long" });
                const [timePartStart, timePartEnd] = [dateStart, dateEnd].map(date => date.toISOString().split("T")[1].substring(0, 5));
                const duration = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60)) * 3;
                const location = (vevent.getFirstPropertyValue('location') || "").split(" - ")[0].trim() || "Inconnu";
                const teacher = "Prof : " + (summary.split(" - ")[3] || "Inconnu");
                const lessonName = (summary.split(" - ")[1]?.split(",")[0].trim() || "Inconnu");

                hours.forEach((hour) => {
                    const timeStart = `${parseInt(timePartStart.split(":")[0])}h${timePartStart.split(":")[1]}`;
                    if (hour.id === timeStart) {
                        const lessonContainer = createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour);
                        setLessonColor(lessonContainer, summary);
                        lessonElements.push(lessonContainer);
                    }
                });
            }
        });

        displayContainer.append(...lessonElements); // Ajout d'éléments en une seule opération DOM
        lessonTitleSize();
        highlightVacations();
        highlightEmptyDays();
    } catch (error) {
        console.error(error);
    }
}
function createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour) {
    const lessonContainer = document.createElement('div');
    lessonContainer.classList.add('lesson');

    // Définir la colonne en fonction du jour de la semaine
    lessonContainer.style.cssText = `grid-column: ${getColumnByDay(dayOfWeek)}; grid-row-start: ${hour.dataset.row}; grid-row-end: ${parseInt(hour.dataset.row) + duration};`;

    // Ajouter l'attribut data-day pour le jour correspondant
    lessonContainer.setAttribute('data-day', dayOfWeek);

    // Créer et ajouter les autres éléments
    const lessonType = document.createElement('div');
    lessonType.classList.add('lesson-type');
    lessonType.innerHTML = summary.split("-")[0] + ' - ' + '<span>' + timePartStart + ' - ' + timePartEnd + '</span>';

    const lessonTitle = document.createElement('div');
    lessonTitle.classList.add('lesson-title');
    lessonTitle.textContent = lessonName;

    const lessonTeacher = document.createElement('div');
    lessonTeacher.classList.add('lesson-teacher');
    lessonTeacher.textContent = teacher;

    const lessonRoom = document.createElement('div');
    lessonRoom.classList.add('lesson-room');
    lessonRoom.textContent = "Salle : " + location;

    lessonContainer.appendChild(lessonType);
    lessonContainer.appendChild(lessonTitle);
    lessonContainer.appendChild(lessonTeacher);
    lessonContainer.appendChild(lessonRoom);

    return lessonContainer;
}

function getColumnByDay(day) {
    const days = { 'lundi': 2, 'mardi': 3, 'mercredi': 4, 'jeudi': 5, 'vendredi': 6 };
    return days[day];
}


function createDiv(className, textContent) {
    const div = document.createElement('div');
    div.classList.add(className);
    div.innerHTML = textContent;
    return div;
}

export function setLessonColor(container, summary) {
    let defaultColor = '#6666cc'; // Darker shade of the original color
    let colors = {
        'TD': '#66cc66', 'TP': '#66cc66', 'CM': '#66a3cc', 'DS': '#cc6666', 'EXAMEN': '#cc6666' };

    if (container) container.style.color = '#ffffff';
    if (hajarColor) {
        colors = { 'TD': '#ffc6b3', 'TP': '#00FF00', 'CM': '#e5e7e9', 'DS': '#d2b4de', 'EXAMEN': '#d2b4de' };
        if (container) container.style.color = '#333333';
        defaultColor = '#FEF5E7';
    }
    if (container) container.style.backgroundColor = colors[summary.split(" ")[0]] || defaultColor;
}

export function updateWeekDisplay() {
    const dWeek = document.querySelector('.d-week');
    const totalWeeks = 52; // You can adjust this if you have more weeks
    let firstWeek = (weekNumber - 1 - 35 + totalWeeks) % totalWeeks || totalWeeks; // Garder entre 0 et 52
    let secondWeek = (weekNumber - 35 + totalWeeks) % totalWeeks || totalWeeks;
    let thirdWeek = (weekNumber + 1 - 35 + totalWeeks) % totalWeeks || totalWeeks;

    // Ensure that the values are within the correct range
    firstWeek = firstWeek === 0 ? totalWeeks : firstWeek;
    secondWeek = secondWeek === 0 ? totalWeeks : secondWeek;
    thirdWeek = thirdWeek === 0 ? totalWeeks : thirdWeek;

    // Réinitialiser le numéro de semaine si nécessaire
    if (weekNumber > 52) {
        setWeekNumber(1); // Réinitialiser à 1 si > 52
    }
    if (weekNumber < 1) {
        setWeekNumber(1);; // Assurer que le numéro de semaine ne soit jamais < 1
    }

    // Ajuster les numéros de semaine adjacents
    if (thirdWeek > 52) {
        thirdWeek = 1; // Passer de 52 à 1
    }
    btnFirstWeek.textContent = firstWeek > 0 ? firstWeek : 52; // Si firstWeek est < 1, mettre à 52
    btnSecondWeek.textContent = secondWeek;
    btnThirdWeek.textContent = thirdWeek;

    // Affichage des boutons
    btnFirstWeek.style.display = (firstWeek < 1) ? 'none' : 'inline-block'; // Masquer si < 1
    btnThirdWeek.style.display = (thirdWeek > 52) ? 'none' : 'inline-block'; // Masquer si > 52
}

function getDayOfWeek(weekNumber, year, dayInWeek) {
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeek = firstDayOfYear.getDay(); // Le jour de la semaine du 1er janvier
    const daysToAdd = (weekNumber - 1) * 7 + dayInWeek - dayOfWeek; // Modifier ici
    const targetDate = new Date(year, 0, 1 + daysToAdd);
    return targetDate.getDate();
}

function getMonthOfWeek(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeek = firstDayOfYear.getDay(); // Le jour de la semaine du 1er janvier
    const daysToAdd = (weekNumber - 1) * 7 - dayOfWeek; // Modifier ici
    const targetDate = new Date(year, 0, 1 + daysToAdd);
    return targetDate.getMonth() + 1;
}

export function updateDisplay() {
    const mondayDate = getDayOfWeek(weekNumber, year, 1);
    const month = getMonthOfWeek(weekNumber, year);
    monday.textContent = `${mondayDate}/${month}`;
    tuesday.textContent = `${adjustDay(mondayDate + 1, month)}/${month}`;
    wednesday.textContent = `${adjustDay(mondayDate + 2, month)}/${month}`;
    thursday.textContent = `${adjustDay(mondayDate + 3, month)}/${month}`;
    friday.textContent = `${adjustDay(mondayDate + 4, month)}/${month}`;
    edtLoad();
}

function adjustDay(day, month) {
    // Vérifier si le jour dépasse le nombre de jours dans le mois
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    return day > lastDayOfMonth ? day - lastDayOfMonth : day;
}

export function createBackgroundLines() {
    const backgroundLines = document.querySelector('.display');
    for (let i = 0; i < 26; i++) {
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.gridRow = `${(i + 1) * 2} / ${(i + 1) * 2 + 2}`;
        backgroundLines.appendChild(line);
        if (i == 9 || i == 10 || i == 11) {
            line.classList.add('lunch')
        }
        if (i % 2 == 0 && i != 10) {
            line.style.height = '2px';
        }
    }
}

function lessonTitleSize() {
    lessonTitles.forEach((lessonTitle) => {
        // Obtenez la longueur du texte dans le titre de la leçon
        const titleTextLength = lessonTitle.textContent.length;

        // Définissez une taille de police de base
        let fontSize = '15px';

        // Si la longueur du texte dépasse une certaine limite, réduisez la taille de la police
        if (titleTextLength > 9) {
            fontSize = '5px'; // Vous pouvez ajuster la taille ici selon vos besoins
        }

        // Appliquez la taille de police calculée au titre de la leçon
        lessonTitle.style.fontSize = fontSize;
    });
}
function EmptyColor(bool) {
    if (bool) return 'rgba(217, 136, 128, 0.3)'
    else return 'rgba(204, 102, 102, 0.3)'
}
function highlightVacations() {
    const hasLessons = displayContainer.querySelector('.lesson');

    // Vérifiez s'il existe déjà un conteneur de vacances
    const existingVacationContainer = displayContainer.querySelector('.vacation-container');
    const existingEmptyContainers = displayContainer.querySelector('.empty-day-container');
    if (existingVacationContainer) existingVacationContainer.remove();
    if(existingEmptyContainers) existingEmptyContainers.remove();
    if (!hasLessons) {
        const vacationContainer = document.createElement('div');
        vacationContainer.classList.add('vacation-container');
        vacationContainer.style = `
            grid-column: 2/7;
            background-color: ${EmptyColor(hajarColor)};
            background-image: repeating-linear-gradient(45deg,
                ${EmptyColor(hajarColor)},
                ${EmptyColor(hajarColor)} 10px,
                transparent 10px,
                transparent 20px);`
            ;
        // Ajouter le conteneur au displayContainer
        displayContainer.appendChild(vacationContainer);
    } else {
        // Si des leçons sont présentes, supprimer le conteneur de vacances s'il existe
        if (existingVacationContainer) {
            existingVacationContainer.remove();
        }
    }
}

function highlightEmptyDays() {
    // Vérifie s'il existe déjà un conteneur de vacances
    const existingVacationContainer = displayContainer.querySelector('.vacation-container');

    // Si le conteneur de vacances existe, ne pas afficher les jours vides
    if (existingVacationContainer) {
        return; // Quittez la fonction si le conteneur de vacances est actif
    }

    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

    // Supprimez les conteneurs vides précédemment créés
    const existingEmptyContainers = displayContainer.querySelectorAll('.empty-day-container');
    existingEmptyContainers.forEach(container => container.remove());

    // Crée un tableau pour stocker les colonnes vides
    const emptyDayContainers = [];

    days.forEach((day, index) => {
        const dayColumn = index + 2; // Colonne correspondante (lundi = 2, mardi = 3, etc.)

        // Vérifie si des leçons existent pour le jour correspondant
        const lessonsInColumn = displayContainer.querySelectorAll(`.lesson[data-day="${day}"]`);

        // Si aucune leçon n'est présente pour le jour, crée un conteneur
        if (lessonsInColumn.length === 0) {
            const emptyDayContainer = document.createElement('div');
            emptyDayContainer.classList.add('empty-day-container');
            emptyDayContainer.style = `
                grid-column: ${dayColumn};
                background-color: ${EmptyColor(hajarColor)};
                background-image: repeating-linear-gradient(45deg,
                    ${EmptyColor(hajarColor)},
                    ${EmptyColor(hajarColor)} 10px,
                    transparent 10px,
                    transparent 20px);`
                ;
            emptyDayContainers.push(emptyDayContainer); // Ajoute le conteneur à la liste
        }
    });

    // Ajoute tous les conteneurs vides en une seule opération DOM
    if (emptyDayContainers.length > 0) {
        displayContainer.append(...emptyDayContainers);
    }
}
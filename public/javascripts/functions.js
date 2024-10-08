import { dropdownContent, dropdown, choosedGroup, displayContainer, hours, btnFirstWeek, btnSecondWeek, btnThirdWeek } from './domElements.js';
//import { setLessonColor, createLessonContainer, getColumnByDay } from './utils.js';
import  { oneJan, weekNumber, year, edtURL, rapidApiProxyUrl } from './utils.js'

export function removeLessons() {
    const lessons = document.querySelectorAll('.lesson');
    lessons.forEach((lesson) => {
        lesson.remove();
    });
}

export async function edtLoad() {
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '0ed569f79cmsha3270f7667b59b9p15b733jsnc48011143b2f',
            'x-rapidapi-host': 'http-cors-proxy.p.rapidapi.com',
            'Content-Type': 'application/json',
            Origin: 'www.example.com',
            'X-Requested-With': 'www.example.com'
        },
        body: JSON.stringify({ url: edtURL })
    };

    try {
        const response = await fetch(rapidApiProxyUrl, options);
        const data = await response.text();
        const vevents = new ICAL.Component(ICAL.parse(data)).getAllSubcomponents('vevent');
    
        // Supprimer les leçons précédentes
        removeLessons();
    
        // Calculer les dates de début et de fin de la semaine
        const startOfWeek = new Date(oneJan);
        startOfWeek.setDate(oneJan.getDate() + (weekNumber - 1) * 7);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
    
        vevents.forEach((vevent) => {
            const dateStart = new Date(vevent.getFirstPropertyValue('dtstart'));
            const dateEnd = new Date(vevent.getFirstPropertyValue('dtend'));
    
            // Vérifier si l'événement est dans la semaine sélectionnée
            if (dateStart >= startOfWeek && dateEnd <= endOfWeek) {
                const summary = vevent.getFirstPropertyValue('summary');
                const offset = (weekNumber >= 44 || weekNumber <= 13) ? 1 : 2;
                [dateStart, dateEnd].forEach(date => date.setHours(date.getHours() + offset));
    
                const dayOfWeek = dateStart.toLocaleDateString("fr-FR", { weekday: "long" });
                const [timePartStart, timePartEnd] = [dateStart, dateEnd].map(date => date.toISOString().split("T")[1].substring(0, 5));
                const duration = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60)) * 3;
                const location = (vevent.getFirstPropertyValue('location') || "").split(" - ")[0].trim() || "Inconnu";
                const teacher = "Prof : " + summary.split(" - ")[3] || "Inconnu";
                const lessonName = summary.split(" - ")[1]?.split(",")[0].trim() || "Inconnu";
    
                hours.forEach((hour) => {
                    const timeStart = `${parseInt(timePartStart.split(":")[0])}h${timePartStart.split(":")[1]}`;
                    if (hour.id === timeStart) {
                        const lessonContainer = createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour);
                        setLessonColor(lessonContainer, summary)
                        displayContainer.appendChild(lessonContainer);
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
    
}

export function createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour) {
    const lessonContainer = document.createElement('div');
    lessonContainer.classList.add('lesson');

    // Définir la colonne en fonction du jour de la semaine
    lessonContainer.style.cssText = `grid-column: ${getColumnByDay(dayOfWeek)}; grid-row-start: ${hour.dataset.row}; grid-row-end: ${parseInt(hour.dataset.row) + duration};`;

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

export function getColumnByDay(day) {
    const days = { 'lundi': 2, 'mardi': 3, 'mercredi': 4, 'jeudi': 5, 'vendredi': 6 };
    return days[day];
}


export function createDiv(className, textContent) {
    const div = document.createElement('div');
    div.classList.add(className);
    div.innerHTML = textContent;
    return div;
}

export function setLessonColor(container, summary) {
    const colors = { 'TD': '#9B7E00', 'TP': '#00FF00', 'CM': '#0022A2', 'DS': '#A20000', 'EXAMEN': '#A20000' };
    container.style.backgroundColor = colors[summary.split(" ")[0]] || '#249b00';
}

export function updateWeekDisplay() {
    const dWeek = document.querySelector('.d-week');
    let firstWeek = weekNumber - 1;
    let secondWeek = weekNumber;
    let thirdWeek = weekNumber + 1;

    // Réinitialiser le numéro de semaine si nécessaire
    if (weekNumber > 52) {
        weekNumber = 1; // Réinitialiser à 1 si > 52
    }
    if (weekNumber < 1) {
        weekNumber = 52; // Assurer que le numéro de semaine ne soit jamais < 1
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

export function getDayOfWeek(weekNumber, year, dayInWeek) {
    const firstDayOfYear = new Date(year, 0, 1);
    const dayOfWeek = firstDayOfYear.getDay(); // Le jour de la semaine du 1er janvier
    const daysToAdd = (weekNumber - 1) * 7 + dayInWeek - dayOfWeek; // Modifier ici
    const targetDate = new Date(year, 0, 1 + daysToAdd);
    return targetDate.getDate();
}

export function getMonthOfWeek(weekNumber, year) {
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

export function adjustDay(day, month) {
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

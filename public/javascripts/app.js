const dropdownGroup = document.getElementById('dropdown-group');
const dropdownContent = document.querySelector('.dropdown-content');
const dropdown = document.querySelector('.dropdown');
const groupButton = document.querySelectorAll('.group');
const choosedGroup = document.getElementById('choosed-group');
const displayContainer = document.querySelector('.display');
const hours = document.querySelectorAll('.hour');

const nextWeek = document.getElementById('next-week');
const previousWeek = document.getElementById('previous-week');
const startWeek = document.getElementById('start-week');
const endWeek = document.getElementById('end-week');
const currentdate = new Date();
let oneJan = new Date(currentdate.getFullYear(), 0, 1);
let numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
let weekNumber = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
const yearNumber = currentdate.getFullYear();

const btnFirstWeek = document.getElementById('first-week');
const btnSecondWeek = document.getElementById('second-week');
const btnThirdWeek = document.getElementById('third-week');

const monday = document.getElementById('monday');
const tuesday = document.getElementById('tuesday');
const wednesday = document.getElementById('wednesday');
const thursday = document.getElementById('thursday');
const friday = document.getElementById('friday');
const year = currentdate.getFullYear();

const lessonTitles = document.querySelectorAll('.lesson-title');

let group = '';
let edtURL = `https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___CILS.ics?version=2024.0.8.0&icalsecurise=93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED&param=643d5b312e2e36325d2666683d3126663d3131303030`;

const rapidApiProxyUrl = 'https://http-cors-proxy.p.rapidapi.com/';

dropdownGroup.addEventListener('click', () => {
    if (dropdownContent.style.display === 'flex') {
        dropdownContent.style.display = 'none';
        dropdown.style.backgroundColor = 'transparent';
    }
    else {
        dropdownContent.style.display = 'flex';
        dropdown.style.backgroundColor = '#000000';
    }
    document.addEventListener('click', (e) => {
        if (e.target !== dropdownGroup) {
            dropdownContent.style.display = 'none';
            dropdown.style.backgroundColor = 'transparent';
        }
    });
});

groupButton.forEach((button) => {
    button.addEventListener('click', () => {
        choosedGroup.textContent = button.textContent;
        group = button.id;

        // Déplacer edtURL ici pour inclure le groupe mis à jour
        edtURL = `https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___${group}.ics?version=2024.0.8.0&icalsecurise=93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED&param=643d5b312e2e36325d2666683d3126663d3131303030`;

        console.log(button.id);
        console.log(edtURL);

        dropdownContent.style.display = 'none';
        dropdown.style.backgroundColor = 'transparent';
        edtLoad();

        // Enregistrer le groupe sélectionné dans le localStorage
        localStorage.setItem('selectedGroup', group);
    });
});

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erreur lors de la requête : ${response.status}`);
    }
    return response.json();
}

function removeLessons() {
    const lessons = document.querySelectorAll('.lesson');
    lessons.forEach((lesson) => {
        lesson.remove();
    });
}

async function edtLoad() {
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

        vevents.forEach((vevent) => {
            const summary = vevent.getFirstPropertyValue('summary');
            const [dateStart, dateEnd] = ['dtstart', 'dtend'].map(prop => new Date(vevent.getFirstPropertyValue(prop)));
            const offset = (weekNumber >= 44 || weekNumber <= 13) ? 1 : 2;
            [dateStart, dateEnd].forEach(date => date.setHours(date.getHours() + offset));

            const dayOfWeek = dateStart.toLocaleDateString("fr-FR", { weekday: "long" });
            const [timePartStart, timePartEnd] = [dateStart, dateEnd].map(date => date.toISOString().split("T")[1].substring(0, 5));
            const duration = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60)) * 3; // Durée en heures (1 heure = 3 unités dans la grille)
            const location = (vevent.getFirstPropertyValue('location') || "").split(" - ")[0].trim() || "Inconnu";
            const teacher = "Prof : " + summary.split(" - ")[3] || "Inconnu";
            const lessonName = summary.split(" - ")[1]?.split(",")[0].trim() || "Inconnu";

            hours.forEach((hour) => {
                const timeStart = `${parseInt(timePartStart.split(":")[0])}h${timePartStart.split(":")[1]}`;
                if (weekNumber === Math.ceil((dateStart.getDay() + 1 + Math.floor((dateStart - oneJan) / (24 * 60 * 60 * 1000))) / 7) && yearNumber === dateStart.getFullYear() && hour.id === timeStart) {
                    const lessonContainer = createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour);
                    setLessonColor(lessonContainer, summary)
                    displayContainer.appendChild(lessonContainer);
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}

function createLessonContainer(dayOfWeek, duration, lessonName, teacher, location, summary, timePartStart, timePartEnd, hour) {
    const lessonContainer = document.createElement('div');
    lessonContainer.classList.add('lesson');

    // Définir la colonne en fonction du jour de la semaine
    lessonContainer.style.cssText = `grid-column: ${getColumnByDay(dayOfWeek)}; grid-row-start: ${hour.dataset.row}; grid-row-end: ${parseInt(hour.dataset.row) + duration};`;

    // Créer et ajouter les autres éléments
    const lessonType = document.createElement('div');
    lessonType.classList.add('lesson-type');
    lessonType.innerHTML = summary.split(" ")[0] + ' - ' + '<span>' + timePartStart + ' - ' + timePartEnd + '</span>';

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

function setLessonColor(container, summary) {
    const colors = { 'TD': '#9B7E00', 'TP': '#00FF00', 'CM': '#0022A2', 'DS': '#A20000', 'EXAMEN': '#A20000' };
    container.style.backgroundColor = colors[summary.split(" ")[0]] || '#249b00';
}

function updateWeekDisplay() {
    const dWeek = document.querySelector('.d-week');
    let firstWeek = weekNumber - 1;
    let secondWeek = weekNumber;
    let thirdWeek = weekNumber + 1;

    btnFirstWeek.textContent = firstWeek;
    btnSecondWeek.textContent = secondWeek;
    btnThirdWeek.textContent = thirdWeek;
    if (weekNumber == 1) {
        btnFirstWeek.style.display = 'none';
    }
    else if (weekNumber == 52) {
        btnThirdWeek.style.display = 'none';
    }
    else {
        btnFirstWeek.style.display = 'inline-block';
        btnThirdWeek.style.display = 'inline-block';
    }
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


function updateDisplay() {
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

nextWeek.addEventListener('click', () => {
    weekNumber++;
    updateWeekDisplay();
    updateDisplay();
});
previousWeek.addEventListener('click', () => {
    weekNumber--;
    updateWeekDisplay();
    updateDisplay();
});
startWeek.addEventListener('click', () => {
    weekNumber -= 5;
    updateWeekDisplay();
    updateDisplay();
});
endWeek.addEventListener('click', () => {
    weekNumber += 5;
    updateWeekDisplay();
    updateDisplay();
});
btnFirstWeek.addEventListener('click', () => {
    weekNumber--;
    updateWeekDisplay();
    updateDisplay();
});
btnSecondWeek.addEventListener('click', () => {
    weekNumber = weekNumber;
    updateWeekDisplay();
    updateDisplay();
});
btnThirdWeek.addEventListener('click', () => {
    weekNumber++;
    updateWeekDisplay();
    updateDisplay();
});

// Parcourez chaque élément de classe "lesson-title"
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

function createBackgroundLines() {
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

document.addEventListener('DOMContentLoaded', () => {
    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) {
        group = savedGroup;
        groupButton.forEach((button) => {
            if (button.id == group) {
                choosedGroup.textContent = button.textContent;
            }
        });
    }
    else {
        group = 'CILS';
        choosedGroup.textContent = 'L3 - CILS';
    }
    updateWeekDisplay();
    updateDisplay();
    createBackgroundLines();
});
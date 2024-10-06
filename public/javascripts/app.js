const dropdownGroup = document.getElementById('dropdown-group');
const dropdownContent = document.querySelector('.dropdown-content');
const dropdown = document.querySelector('.dropdown');
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
let group = '';
let edtURL = `https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___CILS.ics?version=2024.0.8.0&icalsecurise=93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED&param=643d5b312e2e36325d2666683d3126663d3131303030`;
const groupButton = document.querySelectorAll('.group');
const choosedGroup = document.getElementById('choosed-group');
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

const rapidApiProxyUrl = 'https://http-cors-proxy.p.rapidapi.com/';

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
    // Utilisation de RapidApi HTTP Cors Proxy : https://rapidapi.com/pgarciamaurino/api/http-cors-proxy
    const url = rapidApiProxyUrl;
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': '0ed569f79cmsha3270f7667b59b9p15b733jsnc48011143b2f',
            'x-rapidapi-host': 'http-cors-proxy.p.rapidapi.com',
            'Content-Type': 'application/json',
            Origin: 'www.example.com',
            'X-Requested-With': 'www.example.com'
        },
        body: JSON.stringify({
            url: edtURL
        })
    };

    try {
        // Charger les données depuis le fichier ICS via l'API RapidAPI
        const response = await fetch(url, options);
        const data = await response.text();
        // Analyser les données ICS
        const jcalData = ICAL.parse(data);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        // Supprimer les cours précédents
        removeLessons();

        vevents.forEach((vevent) => {
            const summary = vevent.getFirstPropertyValue('summary');
            const dtstart = vevent.getFirstPropertyValue('dtstart');
            const dtend = vevent.getFirstPropertyValue('dtend');
            const dateStart = new Date(dtstart);
            const dateEnd = new Date(dtend);
            // Ajouter le décalage horaire UTC+1 (CET)
            if (weekNumber >= 44 || weekNumber <= 13) {
                dateStart.setHours(dateStart.getHours() + 1);
                dateEnd.setHours(dateEnd.getHours() + 1);
            }
            else {
                dateStart.setHours(dateStart.getHours() + 2);
                dateEnd.setHours(dateEnd.getHours() + 2);
            }
            // Obtenir la date au format "YYYY-MM-DD"
            const datePart = dateStart.toISOString().split("T")[0];
            const dayOfWeek = dateStart.toLocaleDateString("fr-FR", { weekday: "long" });
            // Obtenir l'heure (heures et minutes) au format "HH:mm"
            const timePartStart = dateStart.toISOString().split("T")[1].substring(0, 5);
            const timePartEnd = dateEnd.toISOString().split("T")[1].substring(0, 5);

            const timeDifference = dateEnd.getTime() - dateStart.getTime();
            const hour = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
            let timePartDuration = (hour + 1) * 3;

            const year = dateStart.getFullYear();
            const month = dateStart.getMonth() + 1;
            Date.prototype.getWeekNumber = function () {
                const currentDate = new Date(this);
                currentDate.setHours(0, 0, 0, 0);
                currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));
                const yearStart = new Date(currentDate.getFullYear(), 0, 1);
                const weekNumber = Math.ceil(((currentDate - yearStart) / 86400000 + 1) / 7);
                return weekNumber;
            };
            const week = dateStart.getWeekNumber();
            const maxLocation = vevent.getFirstPropertyValue('location');
            let location = ''; // Déclare une variable vide au cas où maxLocation est null
            if (maxLocation) {
                location = maxLocation.split(" - ")[0].trim();
            } else {
                console.log("Location is null or undefined for this event."); // Log si la location est absente
            }

            const description = vevent.getFirstPropertyValue('description');
            const teacher = "Prof : " + summary.split(" - ")[3];

            const displayContainer = document.querySelector('.display');
            const lessonContainer = document.createElement('div');
            lessonContainer.classList.add('lesson');
            const lessonType = document.createElement('div');
            lessonType.classList.add('lesson-type');
            const lessonTitle = document.createElement('div');
            lessonTitle.classList.add('lesson-title');
            const lessonTeacher = document.createElement('div');
            lessonTeacher.classList.add('lesson-teacher');
            const lessonRoom = document.createElement('div');
            lessonRoom.classList.add('lesson-room');

            let name = '';
            const parts = summary.split(" - ");
            const lessonName1 = parts[1].trim();
            const lessonName = lessonName1.split(",")[0].trim();
            console.log(lessonName);
            if (name == '') {
                name = lessonName;
            }
            if (name == ' - indéfini') {
                name = "JVE-TVE";
            }

            const hours = document.querySelectorAll('.hour');
            hours.forEach((hour) => {
                const timeStart = parseInt(timePartStart.substring(0, 2), 10) + "h" + timePartStart.substring(3, 5);
                if (week == weekNumber && year == yearNumber && (hour.id == timeStart)) {
                    lessonContainer.style.gridRowStart = parseInt(hour.dataset.row);
                    lessonContainer.style.gridRowEnd = parseInt(hour.dataset.row) + timePartDuration;
                    //lessonContainer.style.gridRowEnd = parseInt(hour.dataset.row) + 3;
                    if (dayOfWeek == 'lundi') {
                        lessonContainer.style.gridColumn = 2;
                    }
                    if (dayOfWeek == 'mardi') {
                        lessonContainer.style.gridColumn = 3;
                    }
                    if (dayOfWeek == 'mercredi') {
                        lessonContainer.style.gridColumn = 4;
                    }
                    if (dayOfWeek == 'jeudi') {
                        lessonContainer.style.gridColumn = 5;
                    }
                    if (dayOfWeek == 'vendredi') {
                        lessonContainer.style.gridColumn = 6;
                    }
                    displayContainer.appendChild(lessonContainer);
                    lessonType.innerHTML = summary.split(" ")[0] + ' - ' + '<span>' + timePartStart + ' - ' + timePartEnd + '</span>';
                    if (summary.split(" ")[0] == 'TD') {
                        lessonContainer.style.backgroundColor = '#9B7E00';
                    }
                    if (summary.split(" ")[0] == 'TP') {
                        lessonContainer.style.backgroundColor = '#00FF00';
                    }
                    if (summary.split(" ")[0] == 'CM') {
                        lessonContainer.style.backgroundColor = '#0022A2';
                    }
                    if (summary.split(" ")[0] == 'DS' || summary.split(" ")[0] == 'EXAMEN') {
                        lessonContainer.style.backgroundColor = '#A20000';
                    }
                    lessonTeacher.textContent = teacher;
                    lessonRoom.textContent = "Salle : " + location;
                    lessonTitle.textContent = name;

                    lessonContainer.appendChild(lessonType);
                    lessonContainer.appendChild(lessonTitle);
                    lessonContainer.appendChild(lessonTeacher);
                    lessonContainer.appendChild(lessonRoom);
                }
            });
        });
    }
    catch (error) {
        console.log(error);
    }
}


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

const monday = document.getElementById('monday');
const tuesday = document.getElementById('tuesday');
const wednesday = document.getElementById('wednesday');
const thursday = document.getElementById('thursday');
const friday = document.getElementById('friday');
const year = currentdate.getFullYear();

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

// Sélectionnez tous les éléments de classe "lesson-title"
const lessonTitles = document.querySelectorAll('.lesson-title');

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
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

const groupButton = document.querySelectorAll('.group');
const choosedGroup = document.getElementById('choosed-group');
let group = '';
groupButton.forEach((button) => {
    button.addEventListener('click', () => {
        choosedGroup.textContent = button.textContent;
        group = button.id;
        dropdownContent.style.display = 'none';
        dropdown.style.backgroundColor = 'transparent';
        edtLoad();
        // Enregistrer le groupe sélectionné dans le localStorage
        localStorage.setItem('selectedGroup', group);
    });
});

function edtLoad() {
    fetch(`https://edt-api.obstinate.fr/${group}` /*`https://edt.univ-evry.fr/icsetudiant/${group}_etudiant(e).ics`*/)
        .then(response => response.text())
        .then(data => {
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

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
                const hours = Math.floor(timeDifference / (1000 * 60 * 60));
                const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                let timePartDuration = (hours + 1) * 3;

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
                const location = vevent.getFirstPropertyValue('location');
                const description = vevent.getFirstPropertyValue('description');
                const teacher = description.split("\n")[1];

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

                function removeLessons() {
                    const lessons = document.querySelectorAll('.lesson');
                    lessons.forEach((lesson) => {
                        lesson.remove();
                    });
                }

                removeLessons();
                // Utilisation de la fonction fetchCourseData pour obtenir les données JSON
                let name = '';
                fetch('./name/L2INFO.json')
                    .then(response => response.json()) // Utilisez response.json() pour extraire les données JSON.
                    .then(data => {
                        const lessonNameJson = data.code;
                        const lessonName = summary.split(" ")[0];
                        lessonNameJson.forEach((lesson) => {
                            if (lesson[lessonName] != undefined) {
                                if (lesson[lessonName] == "ALGEBRE ET ARTITHMETIQUE 1") {
                                    if (location !== "1CY-1-A102") {
                                        name = "THEORIE DES LANGAGES";
                                    }
                                }
                                else {
                                    name = lesson[lessonName];
                                }
                            }
                        });
                        if (name == '') {
                            name = summary;
                        }
                        if (name == ' - indéfini') {
                            name = "JVE-TVE";
                        }

                        const hours = document.querySelectorAll('.hour');
                        hours.forEach((hour) => {
                            const timeStart = parseInt(timePartStart.substring(0, 2), 10) + "h" + timePartStart.substring(3, 5);
                            if (week == weekNumber && year == 2023 && (hour.id == timeStart)) {
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
                                lessonType.innerHTML = summary.split(" ")[2] + ' - ' + '<span>' + timePartStart + ' - ' + timePartEnd + '</span>';
                                if (summary.split(" ")[2] == 'TD') {
                                    lessonContainer.style.backgroundColor = '#9B7E00';
                                }
                                if (summary.split(" ")[2] == 'TP') {
                                    lessonContainer.style.backgroundColor = '#00FF00';
                                }
                                if (summary.split(" ")[2] == 'CM') {
                                    lessonContainer.style.backgroundColor = '#0022A2';
                                }
                                if(summary.split(" ")[2] == 'DS' || summary.split(" ")[2] == 'Examen') {
                                    lessonContainer.style.backgroundColor = '#A20000';
                                }
                                lessonTeacher.textContent = teacher;
                                lessonRoom.textContent = "Salle: " + location;
                                lessonTitle.textContent = name;

                                lessonContainer.appendChild(lessonType);
                                lessonContainer.appendChild(lessonTitle);
                                lessonContainer.appendChild(lessonTeacher);
                                lessonContainer.appendChild(lessonRoom);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Erreur lors de la récupération des données JSON :', error);
                    });


            });
        })
        .catch(error => console.log(error));
}

const nextWeek = document.getElementById('next-week');
const previousWeek = document.getElementById('previous-week');
const startWeek = document.getElementById('start-week');
const endWeek = document.getElementById('end-week');
const currentdate = new Date();
let oneJan = new Date(currentdate.getFullYear(), 0, 1);
let numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
let weekNumber = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);

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
    tuesday.textContent = `${mondayDate + 1}/${month}`;
    wednesday.textContent = `${mondayDate + 2}/${month}`;
    thursday.textContent = `${mondayDate + 3}/${month}`;
    friday.textContent = `${mondayDate + 4}/${month}`;
    edtLoad();
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
        group = 'l2infog1';
        choosedGroup.textContent = 'L2 - G1';
    }
    updateWeekDisplay();
    updateDisplay();
    createBackgroundLines();
});
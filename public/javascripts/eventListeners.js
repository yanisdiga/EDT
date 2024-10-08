import {
    dropdownGroup, dropdownContent, dropdown, groupButton, choosedGroup, nextWeek,
    previousWeek, startWeek, endWeek, btnFirstWeek, btnSecondWeek, btnThirdWeek, lessonTitles
} from './domElements.js';
import { edtLoad, updateWeekDisplay, updateDisplay } from './functions.js';
import  { setWeekNumber, weekNumber, setGroup, setEdtUrl, group} from './utils.js'

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
        setGroup(button.id);

        // Déplacer edtURL ici pour inclure le groupe mis à jour
        setEdtUrl(`https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___${group}.ics?version=2024.0.8.0&icalsecurise=93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED&param=643d5b312e2e36325d2666683d3126663d3131303030`);

        dropdownContent.style.display = 'none';
        dropdown.style.backgroundColor = 'transparent';
        edtLoad();

        // Enregistrer le groupe sélectionné dans le localStorage
        localStorage.setItem('selectedGroup', group);
    });
});

nextWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber + 1);
    updateWeekDisplay();
    updateDisplay();
});
previousWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber - 1);
    updateWeekDisplay();
    updateDisplay();
});
startWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber - 5);
    updateWeekDisplay();
    updateDisplay();
});
endWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber + 5);
    updateWeekDisplay();
    updateDisplay();
});
btnFirstWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber - 1);;
    updateWeekDisplay();
    updateDisplay();
});
btnSecondWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber);
    updateWeekDisplay();
    updateDisplay();
});
btnThirdWeek.addEventListener('click', () => {
    setWeekNumber(weekNumber + 1);
    updateWeekDisplay();
    updateDisplay();
});
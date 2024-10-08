export const dropdownGroup = document.getElementById('dropdown-group');
export const dropdownContent = document.querySelector('.dropdown-content');
export const dropdown = document.querySelector('.dropdown');
export const groupButton = document.querySelectorAll('.group');
export const choosedGroup = document.getElementById('choosed-group');
export const displayContainer = document.querySelector('.display');
export const hours = document.querySelectorAll('.hour');
export const nextWeek = document.getElementById('next-week');
export const previousWeek = document.getElementById('previous-week');
export const startWeek = document.getElementById('start-week');
export const endWeek = document.getElementById('end-week');
export const btnFirstWeek = document.getElementById('first-week');
export const btnSecondWeek = document.getElementById('second-week');
export const btnThirdWeek = document.getElementById('third-week');
export const monday = document.getElementById('monday');
export const tuesday = document.getElementById('tuesday');
export const wednesday = document.getElementById('wednesday');
export const thursday = document.getElementById('thursday');
export const friday = document.getElementById('friday');
export const lessonTitles = document.querySelectorAll('.lesson-title');

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
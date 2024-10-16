import { choosedGroup, groupButton } from './domElements.js';
import { edtURL, group, setGroup} from './utils.js';
import { updateWeekDisplay, updateDisplay, createBackgroundLines, edtLoad, goToNextWeekIfSaturday } from './functions.js';

document.addEventListener('DOMContentLoaded', () => {
    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup !== null && savedGroup !== '') {
        setGroup(savedGroup);
        groupButton.forEach((button) => {
            if (button.id == group) {
                choosedGroup.textContent = button.textContent;
            }
        });
    } else {
        setGroup('CILS');
        choosedGroup.textContent = 'L3 - CILS';
    }
    goToNextWeekIfSaturday();
    updateWeekDisplay();
    updateDisplay();
    createBackgroundLines();
});

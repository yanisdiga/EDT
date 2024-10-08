import { choosedGroup, groupButton } from './domElements.js';
import { group, setGroup} from './utils.js';
import { updateWeekDisplay, updateDisplay, createBackgroundLines } from './functions.js';

document.addEventListener('DOMContentLoaded', () => {
    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) {
        setGroup(savedGroup);
        groupButton.forEach((button) => {
            if (button.id == group) {
                choosedGroup.textContent = button.textContent;
            }
        });
    } else {
        group = 'CILS';
        choosedGroup.textContent = 'L3 - CILS';
    }
    updateWeekDisplay();
    updateDisplay();
    createBackgroundLines();
});

import { edtLoad } from "./functions.js";

export const currentdate = new Date();
export const oneJan = new Date(currentdate.getFullYear(), 0, 1);
// Calcul des jours écoulés depuis le 1er janvier
export const numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
// Ajustement pour commencer la semaine le lundi
const janFirstDayOfWeek = oneJan.getDay();
const adjustment = (janFirstDayOfWeek === 0 ? 6 : janFirstDayOfWeek - 1);
export let weekNumber = Math.ceil((numberOfDays + adjustment) / 7);
export let year = currentdate.getFullYear();
export let group = '';
const groupConfigurations = {
    CILS: {
        version: '2024.0.8.0',
        icalsecurise: '84455A792F8A8F2954DA3E6944293EFA1F6FC3BD25AE2AFC02D69DACF42B0E331338BFD7AD13A2480C02EFD0E435396A',
        param: '643d5b312e2e36325d2666683d3126663d31',
    },
    ASR: {
        version: '2024.0.8.0',
        icalsecurise: '',
        param: '643d5b312e2e36325d2666683d3126663d3131303030',
    },
    MIAGE_I: {
        version: '2024.0.8.0',
        icalsecurise: '02F2388C911CC441B8584516B57788B91067EC065105BB46790DD6BE792F9005D94053CBD6D7E127438B0024F00D6359',
        param: '643d5b312e2e36325d2666683d3126663d3131303030',
    },
};
export let edtURL = ''; // Initialisation de l'URL
const corsproxy = 'https://corsproxy.io/?';
export let changeColor = localStorage.getItem('changeColor') === 'true';

export function setWeekNumber(newWeekNumber) {
    weekNumber = newWeekNumber; // Assurez-vous que 'weekNumber' est défini au début du fichier
}

export function setYear(newYear) { 
    year = newYear;
}

export function setGroup(newGroup) {
    group = newGroup; // Assurez-vous que 'group' est défini au début du fichier
    setEdtUrl(newGroup); // Met à jour l'URL lorsque le groupe change
}

export function setEdtUrl(group) {
    // Vérifiez si le groupe est dans les configurations
    if (groupConfigurations[group]) {
        edtURL = `${corsproxy}https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___${group}.ics?version=${groupConfigurations[group].version}&icalsecurise=${groupConfigurations[group].icalsecurise}&param=${groupConfigurations[group].param}`;
    } else {
        console.error(`Group ${group} is not defined in groupConfigurations.`);
    }
}
export function setColor(newColor) {
    changeColor = newColor;
    localStorage.setItem('changeColor', changeColor);
    edtLoad();
}

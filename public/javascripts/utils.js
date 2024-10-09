import { edtLoad } from "./functions.js";

export const currentdate = new Date();
export let oneJan = new Date(currentdate.getFullYear(), 0, 1);
export let numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
export let weekNumber = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
export let year = currentdate.getFullYear();
export let group = '';
const groupConfigurations = {
    CILS: {
        version: '2024.0.8.0',
        icalsecurise: '93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED',
        param: '643d5b312e2e36325d2666683d3126663d3131303030',
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
export let hajarColor = localStorage.getItem('hajarColor') === 'true';

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
export function setHajarColor(newColor) {
    hajarColor = newColor;
    localStorage.setItem('hajarColor', hajarColor);
    edtLoad();
}
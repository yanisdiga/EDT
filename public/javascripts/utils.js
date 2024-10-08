export const currentdate = new Date();
export let oneJan = new Date(currentdate.getFullYear(), 0, 1);
export let numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
export let weekNumber = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
export const year = currentdate.getFullYear();
export let edtURL = `https://edt-univ-evry.hyperplanning.fr/hp/Telechargements/ical/Edt_L3_Informatique___CILS.ics?version=2024.0.8.0&icalsecurise=93006A33D29EA91DA5D60BC1D0D98324B89B126ED51536D424B2DD7BB56FA80EBC49F5B064D36C76B6B7247CEE95B6ED&param=643d5b312e2e36325d2666683d3126663d3131303030`;
export const rapidApiProxyUrl = 'https://http-cors-proxy.p.rapidapi.com/';
export let group = '';
export function setWeekNumber(newWeekNumber) {
    weekNumber = newWeekNumber;
}
export function setGroup(newGroup) {
    group = newGroup;
}
export function setEdtUrl(newEdt){
    edtURL = newEdt;
}
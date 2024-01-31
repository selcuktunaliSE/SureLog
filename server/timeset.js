const date = new Date();
const localdate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
console.log(date);
console.log(localdate);
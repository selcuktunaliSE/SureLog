const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const formatDateWithTime = (dateStr) => {

    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date.getTime() - offset - 3 * 3600000);

    const day = localTime.getDate().toString().padStart(2, '0');
    const month = (localTime.getMonth() + 1).toString().padStart(2, '0');
    const year = localTime.getFullYear();
    const hours = localTime.getHours().toString().padStart(2, '0');
    const minutes = localTime.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

module.exports = {
    formatDate,
    formatDateWithTime,
}
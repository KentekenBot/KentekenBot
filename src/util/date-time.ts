export class DateTime {
    public static timeSince(timeStamp: Date) {
        const now = new Date();
        const secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;

        if (secondsPast < 60) {
            return `${parseInt(secondsPast as unknown as string)} seconden geleden`;
        }
        if (secondsPast < 3600) {
            return `${parseInt(secondsPast / 60 as unknown as string)} minuten geleden`;
        }
        if (secondsPast <= 86400) {
            return `${parseInt(secondsPast / 3600 as unknown as string)} uur geleden`;
        }
        if (secondsPast > 86400) {
            const day = timeStamp.getDate();
            const month = timeStamp.toDateString().match(/ [a-zA-Z]*/)![0].replace(' ', '');
            const year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
            return day + " " + month + year;
        }
    }
}

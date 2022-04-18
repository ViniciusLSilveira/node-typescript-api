import moment from 'moment';

// TODO implement unit tests
export class TimeUtil {
    public static getUnixTimeForAFutureDay(days: number): number {
        return moment().add(days, 'days').unix();
    }
}

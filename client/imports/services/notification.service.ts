
declare let Materialize : any;

export class NotificationService {

    public success(message) {
        Materialize.toast(message, 4000);
    }

    public error(message) {
        Materialize.toast(message, 4000);
    }
}
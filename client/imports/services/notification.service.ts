
declare let Materialize : any;
declare let $ : any;

export class NotificationService {


    public success(message, time : number = 4000) {
        let successToast = $('<span class="successToast">' + message + ' <i class="material-icons tiny">check</i></span>');
        Materialize.toast(successToast, time);
    }

    public error(message, time : number = 4000) {
        let errorToast = $('<span class="errorToast">' + message + ' <i class="material-icons tiny">error</i></span>');
        Materialize.toast(errorToast, time);
    }

    public warning(message, time : number = 4000) {
        Materialize.toast(message, time);
    }

    public notPermitted() {
        this.error("Not permitted");
    }

    
}
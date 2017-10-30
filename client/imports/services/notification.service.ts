
declare let Materialize : any;
declare let $ : any;

export class NotificationService {


    public success(message) {
        let successToast = $('<span class="successToast">' + message + ' <i class="material-icons tiny">check</i></span>');
        Materialize.toast(successToast, 4000);
    }

    public error(message) {
        let errorToast = $('<span class="errorToast">' + message + ' <i class="material-icons tiny">error</i></span>');
        Materialize.toast(errorToast, 4000);
    }

    public warning(message) {
        Materialize.toast(message, 4000);
    }

    
}
import template from "./confirmModal.html";

declare let $ : any;

/**
 * This class is a service to create and use a simple confirmation modal. It uses the confirmModal.html as a template.
 * However it is a bit tricky to work with angular in a not created template jquery works fine.
 * e.g If you want to confirm a deletion of something (take a look at dashboard.component.ts to see how it works)
 */
export class ConfirmationModalService {

    private promise : Promise<boolean>;

    /**
     * This function is used to call a confirmation modal. It opens a modal with the given attributes and returns a promise for future values (button presses)
     * @param {string} title The title of the modal to show
     * @param {string} content The content/ text part of the modal to show
     * @returns {Promise<boolean>} A promise that returns true if "Yes" was clicked, otherwise false
     */
    openModal(title : string = "Confirm", content : string = "Do you really want to do that?") : Promise<boolean> {
        this.promise = new Promise((resolve, reject) => {

            //add the modal to the current body
            $('body').append(template);

            //clear and reset title and content
            $('#confirm_modal_title').empty().append(title);
            $('#confirm_modal_content').empty().append(content);

            //init modal with modal options
            $('#confirmModal').modal({
                dismissible: false
            });

            //open modal
            $('#confirmModal').modal('open');

            //add button actions
            $('#yesBtn').click(function () {
                resolve(true);
            });
            $('#noBtn').click(function () {
                resolve(false);
            });
        });
        return this.promise;
    }
}

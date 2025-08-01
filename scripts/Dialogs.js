/**
 * Displays an incompatibility dialog to the user with specific information about the generation provided.
 * The dialog includes a title, content describing the incompatibility, and a dismiss button.
 *
 * @param {number} generation - The current generation number to be displayed in the dialog.
 * @return {void} This method does not return a value.
 */
function showIncompatibilityDialog(generation) {
    new Dialog({
        title: `Roger's Additional Metric Ruler Labels`,
        content: "<h2>" + game.i18n.localize("metric-ruler-labels.incompatibility.title") + "<br> Current Generation: " + generation + " </h2>" +
            "<p>" + game.i18n.localize("metric-ruler-labels.incompatibility.infotext") + "</p> <br>",
        buttons: {
            dismiss: {
                icon: '<i class="fas fa-times"></i>',
                label: "Got it!"
            }
        }
    }, {width: 600}).render(true);
}

/**
 * Displays an incompatibility dialogV2 with a given generation notice.
 * The dialog prompts the user with information about the current generation
 * and allows them to proceed or dismiss.
 *
 * @param {string|number} generation - The current generation information to display in the dialog.
 * @return {Promise<boolean>} A promise that resolves to a boolean indicating the user's choice. True if the user proceeded, false otherwise.
 */
async function showIncompatibilityDialogV2(generation) {
    const proceed = await foundry.applications.api.DialogV2.prompt({
        window: {title: "Roger's Additional Metric Ruler Labels"},
        content:"<h2>" + game.i18n.localize("metric-ruler-labels.incompatibility.title") + "<br> Current Generation: " + generation + " </h2>" +
            "<p>" + game.i18n.localize("metric-ruler-labels.incompatibility.infotext") + "</p> <br>",
        modal: true
    });
}

/**
 * Displays a dialog informing the user that the libWrapper dependency is not found.
 *
 * This method creates and shows a dialog box with a title and a message explaining
 * the missing dependency. The dialog includes a single button to dismiss it.
 *
 * @return {void} This function does not return any value.
 */
function libWrapperNotFoundDialog() {
    new Dialog({
        title: `Roger's Additional Metric Ruler Labels`,
        content: "<h2>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.title") + "</h2>" +
            "<p>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.infotext") + "</p> <br>",
        buttons: {
            dismiss: {
                icon: '<i class="fas fa-times"></i>',
                label: "Got it!"
            }
        }
    }, {width: 600}).render(true);
}

/**
 * Displays a dialogV2 to notify the user about the missing libWrapper dependency.
 * This dialog serves as an alert for users to address the missing library, crucial for the functionality of the module.
 *
 * @return {Promise<void>} Resolves once the dialog is acknowledged or dismissed by the user.
 */
async function libWrapperNotFoundDialogV2() {
    const proceed = await foundry.applications.api.DialogV2.prompt({
        window: {title: "Roger's Additional Metric Ruler Labels"},
        content: "<h2>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.title") + "</h2>" +
            "<p>" + game.i18n.localize("metric-ruler-labels.dependencies.libWrapper.infotext") + "</p> <br>",
        modal: true
    });
}


export {
    showIncompatibilityDialog,
    showIncompatibilityDialogV2,
    libWrapperNotFoundDialog,
    libWrapperNotFoundDialogV2
};

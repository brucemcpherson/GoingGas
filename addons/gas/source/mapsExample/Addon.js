'use strict';
/**
 * Adds a custom menu with items to show the sidebar and dialog.
 *
 * @param {Object} e The event parameter for a simple onOpen trigger.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createAddonMenu()
      .addItem('Show airport map', 'showMap')
      .addToUi();
}

/**
 * Runs when the add-on is installed; calls onOpen() to ensure menu creation and
 * any other initializion work is done immediately.
 *
 * @param {Object} e The event parameter for a simple onInstall trigger.
 */
function onInstall(e) {
  onOpen(e);
}


/**
 * Opens a sidebar. 
 */
function showMap() {

  var ui = HtmlService.createTemplateFromFile('index.html')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Airport map');
  
  SpreadsheetApp.getUi().showSidebar(ui);
}


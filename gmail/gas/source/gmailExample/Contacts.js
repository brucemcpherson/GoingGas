var Contacts = (function(contacts) {
  'use strict';
  
  /**
   * get a contact
   * @param {string} address the email address
   * @param {boolean} [create=false] create if it doesnt exist
   * @param {string} [givenName] given name to set if created
   * @param {string} [familyName] familyName to set if created
   * @return {Contact|null} the contact
   */
  contacts.getContact = function (address,create,givenName,familyName) {
    var contact = ContactsApp.getContact(address);

    // create it
    if (!contact && create) {
      contact = ContactsApp.createContact(
        givenName || Utils.getMatchPiece(/(.+)\@/,address,'unknown') , 
        familyName || Utils.getMatchPiece(/.+\@(.+)/,address,'unknown'), 
        address);
    }
    
    return contact;

  };
  
  /**
   * get a contact group
   * @param {string} name name of the contact group
   * @param {boolean} [create=false] create if it doesnt exist
   * @return {ContactGroup|null} the contact group
   */
  contacts.getContactGroup = function (name,create) {
   
    var group = ContactsApp.getContactGroup(name);

    // create it
    if (!group && create) {
      group = ContactsApp.createContactGroup(name);
    }
    
    return group;

  };
  
  /**
   * check if a member of a group
   * @param {ContactGroup} group the contact group
   * @param {Contact} contact the contact
   * @return {boolean} whether is in group
   */
  contacts.isInGroup = function (group,contact) {
    // check if in
    return group ?
      contact.getContactGroups().some(function(d) { return d.getId() === group.getId(); }) :
      false;
  };
  
  return contacts;
  
})(Contacts || {});

Attribute VB_Name = "Contacts_"
Option Explicit
'  /**
'   * get the contact folder
'   * @return {Calendar} the calendar
'   */
Public Function getContacts() As folder
    Set getContacts = Session.GetDefaultFolder(olFolderContacts)
End Function


'  /**
'   * get a contact
'   * @param {string} address the email address
'   * @param {boolean} [create=false] create if it doesnt exist
'   * @param {string} [givenName] given name to set if created
'   * @param {string} [familyName] familyName to set if created
'   * @return {Contact|null} the contact
'   */
Public Function getContact(address As String, create As Boolean, givenName As String, _
        familyName As String) As ContactItem
        
    Dim contacts As folder, contact As ContactItem, restriction As String, _
        e As Outlook.ContactItem, matches As items
    
    Set contacts = getContacts()
    
    ' see if we know this person
    restriction = "[Email1Address] = '" & _
        address _
        & "' OR [Email2Address] = '" & _
        address _
        & "' OR [Email3Address] = '" & _
        address _
        & "'"
    
    Set matches = contacts.items.Restrict(restriction)
    
    ' just consider contact class
    For Each e In matches
        If e.Class = olContact Then
            Set contact = e
            Exit For
        End If
    Next e
    
    If contact Is Nothing And create Then
        ' add it
        Set contact = Application.CreateItem(olContactItem)
        With contact
            .Email1Address = address
            .FirstName = givenName
            .LastName = familyName
            .Save
        End With
    End If
    
    Set getContact = contact
End Function

'  /**
'   * get a contact group
'   * @param {string} name name of the contact group
'   * @param {boolean} [create=false] create if it doesnt exist
'   * @return {ContactGroup|null} the contact group
'   */
Function getContactGroup(name As String, create As Boolean) As DistListItem
  Dim contacts As folder, group As DistListItem, _
        e As Object, o As DistListItem
    
    Set contacts = getContacts()

    ' just consider dl class
    For Each e In contacts.items
        If e.Class = olDistributionList Then
            Set o = e
            If o.DLName = name Then
                Set group = e
                Exit For
            End If
        End If
    Next e

    If group Is Nothing And create Then
        Set group = Application.CreateItem(olDistributionListItem)
        With group
            .DLName = name
            .Save
        End With
    End If
    
    Set getContactGroup = group
End Function

'
'  /**
'   * check if a member of a group
'   * @param {ContactGroup} group the contact group
'   * @param {Contact} contact the contact
'   * @return {boolean} whether is in group
'   */
Public Function isInGroup(group As DistListItem, contact As ContactItem) As Boolean
    Dim i As Long, r As Recipient
    
    If Not group Is Nothing Then
        For i = 1 To group.MemberCount
            Set r = group.GetMember(i)
            If (r.address = contact.Email1Address Or r.address = contact.Email2Address _
                Or r.address = contact.Email3Address) Then
                isInGroup = True
            End If
        Next i
    End If
    isInGroup = False
End Function


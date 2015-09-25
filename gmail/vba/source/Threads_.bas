Attribute VB_Name = "Threads_"
Option Explicit
'  /**
'   * get matching messages
'   * @return {collecton} the qualifying messages
'   */

' note that the behavior is a little different than the apps script version.
' its organized by message rather than thread so its easier to deal with
Public Function threadsGet() As Collection
    Dim outlookFolder As Outlook.folder, filter As String, _
        items As Outlook.items, mailItem As Outlook.mailItem, _
        result As Collection, item As Object, category As Outlook.category
    
    'this will contain the final list of qualifiying messages
    Set result = New Collection
    
    ' get the specified folder to look in
    Set outlookFolder = getFolder(Settings.getValue("THREADS.IN"))
    
    ' set up date filters
    filter = "[ReceivedTime] > '" & _
        Format(Settings.getValue("THREADS.AFTER"), "ddddd h:nn AMPM") & "'"
    
    ' apply filters and get matching items
    Set items = outlookFolder.items.Restrict(filter)
    
    Set category = getLabel()
    
    ' do some further filtering on the body - searching can't be done on the body with restrict
    ' also categories need to be done here too since they cant be searched on properly in restrict
    For Each item In items
        ' can be other stuff than mail in a folder
        If (TypeName(item) = "MailItem") Then
            ' reclass to correct type
            Set mailItem = item
            
            ' if the mail contains the key phrase and its already categorized, then it qualifies
            If (VBA.InStr(1, mailItem.categories, category.name) < 1 And _
                mailItem.FlagRequest <> Settings.getValue("THREADS.FLAG") And _
               (VBA.InStr(1, LCase(mailItem.Subject), _
                  LCase(Settings.getValue("THREADS.PHRASE"))) > 0 Or _
                VBA.InStr(1, LCase(mailItem.Body), _
                  LCase(Settings.getValue("THREADS.PHRASE"))) > 0)) Then
                result.add mailItem
            End If
        
        End If
    Next item

    
    Set threadsGet = result
End Function
'  /**
'  * get a labels -
'  * @return {Category} the label
'  */
Private Function getLabel() As category
    Dim categories As Outlook.categories, category As category
    
    Set categories = Session.categories
    For Each category In categories
        If (category.name = Settings.getValue("THREADS.LABEL")) Then
            Set getLabel = category
            Exit Function
        End If
    Next category
    
    ' create a new one
    Set getLabel = categories.add(Settings.getValue("THREADS.LABEL"))
    
End Function

Private Function getNS() As Outlook.NameSpace
    Set getNS = Application.GetNamespace("MAPI")
End Function
' find a folder given a path
' will just bomb out if folder doesnt exist.
Private Function getFolder(path As String) As Outlook.folder
    
    Dim folder As Outlook.folder, splitPath As Variant, i As Long
    
    'the folder name components
    splitPath = VBA.Split(path, "/")
    
    'get the top level folder
    Set folder = Session.GetDefaultFolder(olFolderInbox).parent.Folders(CStr(splitPath(0)))

    ' and any subfolders further down
    For i = LBound(splitPath) + 1 To UBound(splitPath)
        Set folder = folder.Folders.item(CStr(splitPath(i)))
    Next i
         
    Set getFolder = folder
End Function
 
'  /**
'   * replies
'   * @param {kvpairs} mobs organized messages to process
'   */
Public Function send(mobs As KVPairs)
    Dim emailsNeeded As Collection, thread As KVPairs, flight As KVPairs, _
        threadKey As Variant, flightKey As Variant, mob As KVPairs, _
        attachments As Outlook.attachments, message As Outlook.mailItem, _
        person As KVPairs, attachment As Outlook.attachment, personFolder As Object, kv As KVPairs, _
        archiveFolder As Object, flightFolder As Object
    
    Set emailsNeeded = New Collection
    
    For Each threadKey In mobs.getKeys
        Set thread = mobs.getValue(threadKey)
        For Each flightKey In thread.getKeys
        
            '// this should make it clearer where each item is coming from
            Set flight = thread.getValue(flightKey)
            Set attachments = flight.getValue("attachments")
            Set mob = flight.getValue("mob")
            Set message = mob.getValue("message")
        
            '// extract out the sender details
            Set person = getSplitEmail(message)
            
            '// all this is input to drive the email sensig session
            Set kv = New KVPairs
            kv.add "mob", mob
            kv.add "person", person
            kv.add "contact", Contacts_.getContact(person.getValue("email"), True, _
                person.getValue("display"), person.getValue("display"))
        
            '// if there are attachments we need to save them
            If (attachments.Count > 0) Then
                Set archiveFolder = FilePaths_.getFolderFromPath(Settings.getValue("PATHS.ARCHIVE"), True)
                Set personFolder = FilePaths_.getFolderFromPath(archiveFolder.path & _
                    "\" & person.getValue("display"), True)
                Set flightFolder = FilePaths_.getFolderFromPath(personFolder.path & _
                    "\" & mob.getValue("flightNumber"), True)
                
                For Each attachment In attachments
                    attachment.SaveAsFile (flightFolder.path & "\" & attachment.fileName)
                Next attachment
                
                kv.add "files", attachments
                kv.add "folder", flightFolder
                
            End If
            
            ' all the details for emails to be added
            emailsNeeded.add kv, threadKey & "_" & flightKey

            
        Next flightKey
    Next threadKey
    
    '// now deal with scheduled courses
    Courses_.organizeCourses emailsNeeded
    
    '// send confirmation mails
    sendEmails emailsNeeded
    
    '//mark all as processed
    For Each thread In emailsNeeded
        Set message = thread.getValue("mob").getValue("message")
        
        ' ceheck to see if this category os already known
        Dim cats As Variant, i As Long, cat As String
        cats = Split(message.categories, ",")
        For i = LBound(cats) To UBound(cats)
            If (cats(i) = Settings.getValue("THREADS.LABEL")) Then cat = cats(i)
        Next i
        
        ' add the category for the thread
        If (cat = vbNullString) Then
            ReDim cats(LBound(cats) To UBound(cats) + 1)
            cats(UBound(cats)) = Settings.getValue("THREADS.LABEL")
            message.categories = Join(cats, ",")
        End If
        
        ' flag the individual message
        message.FlagRequest = Settings.getValue("THREADS.FLAG")
        message.Save
        
    Next thread

End Function

'  /**
'   * send message
'   * @param {object} organized messages to process
'   */
Private Function sendEmails(emailsNeeded As Collection)
    Dim organize As KVPairs, kv As KVPairs, flight As Variant, flights As Collection, _
        thisPerson As Collection, Key As Variant, htmlBody As String, _
        att As attachment, atts As attachments
    Set organize = New KVPairs
    

    '// reduce to one item per person
    For Each kv In emailsNeeded
        Key = kv.getValue("person").getValue("email")
        If Not organize.exists(Key) Then
            Set thisPerson = New Collection
            organize.add CStr(Key), thisPerson
        Else
            Set thisPerson = organize.getValue(Key)
        End If
        thisPerson.add kv, kv.getValue("mob").getValue("flightNumber")
        
    Next kv
    
    '// do the sending
    For Each Key In organize.getKeys
        Set flights = organize.getValue(Key)
        
        htmlBody = "'<h4>Dear " & flights(1).getValue("person").getValue("display") & _
            "</h4>" & "<p>Thank you for your flight data submission<br></p>"
        
        ' a line in the email for each flight
        For Each flight In flights
            ' type of message depends on whether there were files
            If flight.exists("files") Then
                
                htmlBody = htmlBody & _
                  "<p>You uploaded the following files for " & _
                  flight.getValue("mob").getValue("name") & " flight " & _
                  flight.getValue("mob").getValue("flightNumber") & "</p>" & _
                  "<table><tr><th>Name</th><th>Folder</th></tr>"
                
                ' list the files and the folder they are in
                For Each att In flight.getValue("files")
                  htmlBody = htmlBody & "<tr>" & _
                    "<td>" & att.DisplayName & "</td>" & _
                    "<td>" & flight.getValue("folder").name & "</td></tr>"
                Next att
                htmlBody = htmlBody & "</table>"
                
            Else
                htmlBody = htmlBody + "<p>For " & flight.getValue("mob").getValue("name") & _
                  " flight " & flight.getValue("mob").getValue("flightNumber") & _
                  " there were no files attached. Please resubmit, this time with the expected attachments</p>"
            End If
        
        Next flight
        
        With Outlook.Application.CreateItem(olMailItem)
            .To = Key
            .Subject = "your flight data submission"
            .BodyFormat = olFormatHTML
            .htmlBody = htmlBody
            .send
        End With

    Next Key

End Function


Private Function getSplitEmail(item As Outlook.mailItem) As KVPairs
    
    Dim person As KVPairs
    Set person = New KVPairs
    person.add "email", item.SenderEmailAddress
    person.add "display", item.SenderName
    Set getSplitEmail = person
    
End Function



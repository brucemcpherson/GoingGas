Attribute VB_Name = "Match_"
Option Explicit
'  /**
'   * filter the threads based on wteher they have any likely flight numbers
'   * @param {collection} threads the threads
'   * @param {ListObject} lookup the lookup spreadsheet data
'   * @return {collection} the filtered messages
'   */
Public Function messages(threads As Collection, lookup As ListObject) As Collection
    
    Dim rx As RegExp, message As Outlook.mailItem, _
        found As MatchCollection, content As String, mobs As Collection, kv As KVPairs
        
    Set mobs = New Collection
    '// set up the regex for the flight number pattern
    Set rx = New RegExp
    rx.pattern = getRegex(lookup)
    rx.ignorecase = True
    rx.MultiLine = True
    rx.Global = True
    
    '// look at each message
    For Each message In threads
    
        content = message.Body
    
        '// see if there's a flight number in the subject or the body
        Set found = rx.Execute(message.Subject)
        If (found.Count = 0) Then Set found = rx.Execute(content)

        '// set up an object with useful kv pairs and add to the collection
        If (found.Count > 0) Then
            Set kv = New KVPairs
            kv.add "flightNumber", CStr(found.item(0))
            kv.add "message", message
            kv.add "name", findCarrierName(lookup, CStr(found.item(0).SubMatches.item(0)))
            mobs.add kv
        End If
        
     
    Next message
    
    Set messages = mobs
End Function
Private Function findCarrierName(lookup As ListObject, code As String) As String
    Dim r As Range
    
    For Each r In lookup.ListColumns(Settings.getValue("HEADINGS.CODE")).Range.Cells
        If (VBA.LCase(r.value) = VBA.LCase(code)) Then
            findCarrierName = r.Offset(r.Column - _
                lookup.ListColumns(Settings.getValue("HEADINGS.NAME")).Range.Column).value
            Exit Function
        End If
    Next r
    
    ' should never happen since the regex was derived from this.
    Debug.Assert False
    
End Function
'  /**
'   * make the regex for flight matching
'   * @param {ListObject} lookup the lookup data
'   * @return {Regexp} the matching regex
'   */
Private Function getRegex(lookup As ListObject) As String
'
'      // according to wikipedia, https://en.wikipedia.org/wiki/Airline_codes
'      // a flight number looks like this
'      // - xx(a)n(n)(n)(n)(a)
'      // xx = the airline code
'      // n - between 1 and 3 numberic codes
'      // a - an operational optional code
    Dim carrierList As String, r As Range
    carrierList = ""
    
    ' add each of the flight codes
    For Each r In lookup.ListColumns(Settings.getValue("HEADINGS.CODE")).Range.Cells
        carrierList = carrierList + r.value + "|"
    Next r
    
    ' get rid of the trailing delimiter
    If (Len(carrierList) > 0) Then carrierList = Left(carrierList, Len(carrierList) - 1)
    
    getRegex = "\b(" & carrierList & ")([a-z]?)(\d{1,4}[a-z]?)\b"
    
End Function
'  /**
'   * organize the messages into threads/messages/flightnumbers giving priority to attachments
'   * @param {collection} the filtered messages
'   * @return {collection} the organized messages
'   */
Public Function organize(mobs As Collection) As KVPairs
    Dim threadId As String, mob As KVPairs, organizedMob As KVPairs, _
        message As Outlook.mailItem, ob As KVPairs, _
        attachments As Outlook.attachments
        
    Set organizedMob = New KVPairs
    
    For Each mob In mobs
    
        ' the original qualifying message
        Set message = mob.getValue("message")
        
        '  use the conversation id
        threadId = CStr(message.ConversationID)
        
        ' create a new entry for this thread if it doesnt exist
        If (Not organizedMob.exists(threadId)) Then
            organizedMob.add threadId, New KVPairs
        End If
        
        ' create a new entry for this thread/flight combination if it doesnt exist
        If (Not organizedMob.getValue(threadId) _
                .exists(mob.getValue("flightNumber"))) Then
            organizedMob.getValue(threadId).add _
                mob.getValue("flightNumber"), New KVPairs
        End If
        
        ' this is where we'll add the details of this flight
        Set ob = organizedMob.getValue(threadId).getValue(mob.getValue("flightNumber"))
        
        ' get any attachments
        Set attachments = message.attachments
        
        ' messages with attachments take priority
        If (attachments.Count > 0 Or Not ob.exists("attachments")) Then
           ob.replace "attachments", attachments
           ob.replace "mob", mob
        End If
        
    Next mob

    Set organize = organizedMob
    
End Function

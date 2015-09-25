Attribute VB_Name = "MatchGAS_"
Option Explicit

'  /**
'   * use gas to check if there's any flight content
'   * @param {Mailitem} message the message
'   * @return {collection} the filtered messages
'   */
Private Function gasCheck(message As Outlook.mailItem) As KVPairs
    Dim hob As Object, combinedContent As String, root As Object, _
        doc As Object, kv As KVPairs, node As Object
    Set doc = CreateObject("MSXML2.DOMDocument")
    Set kv = New KVPairs
    
    ' avoid two calls by combining subject and body
    combinedContent = message.Subject & " " & message.Body
    
    ' set up a fetch
    Set hob = CreateObject("Msxml2.ServerXMLHTTP.6.0")
    
    
    'construct a query
    hob.Open "GET", Settings.getValue("GAS.URL") & _
        "?format=xml&flight=" & Utils_.encodeURI(combinedContent), False
    
    ' add the access token
    hob.SetRequestHeader "Authorization", getGoogled("drive").authHeader
    hob.send
    
    ' convert to xml element
    doc.LoadXML hob.ResponseText
    Set root = doc.SelectSingleNode("root")

    ' replace this with some appropriate exception habdling
    Debug.Assert Not root Is Nothing
    
    ' load to a key value pair structure
    For Each node In root.ChildNodes
        kv.add node.nodeName, node.Text
    Next node
    
    ' return result
    Set gasCheck = kv
    

End Function
'  /**
'   * filter the threads based on wteher they have any likely flight numbers
'   * @param {collection} threads the threads
'   * @return {collection} the filtered messages
'   */
Public Function messages(threads As Collection) As Collection
    
    Dim message As Outlook.mailItem, mobs As Collection, kv As KVPairs, found As KVPairs
        
    Set mobs = New Collection

    '// look at each message
    For Each message In threads
    
        ' ask apps script to do the work
        Set found = gasCheck(message)
        If (found.getValue("status") = "ok") Then

'        '// set up an object with useful kv pairs and add to the collection
            Set kv = New KVPairs
            kv.add "flightNumber", found.getValue("flight")
            kv.add "message", message
            kv.add "name", found.getValue("name")
            mobs.add kv
        End If
        
     
    Next message
    
    Set messages = mobs
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



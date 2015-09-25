Attribute VB_Name = "Code"
Option Explicit
Public Settings As KVPairs
Private Sub trigger()
    Dim carrierData As ListObject, sob As SheetOb, threads As Collection, _
        mobs As Collection, organized As KVPairs
    Set sob = New SheetOb
    
    ' get the settings from registry
    Set Settings = Settings_.getProperties()
    
    ' get the data - not needed if using matchgas
    'Set carrierData = sob.sheetOpen(Settings.getValue("lookup.id"), _
    '   Settings.getValue("lookup.name")).getData()
    
    '  // get all the potential threads
    Set threads = Threads_.threadsGet
    
    ' // match for any likely flights
    'Set mobs = Match_.messages(threads, carrierData)

    ' // alternative for using GAS
    Set mobs = MatchGAS_.messages(threads)
    
    '// organize matches to prrioritize
    Set organized = Match_.organize(mobs)
    
    '// send the mails
    Threads_.send organized
    
    '// close without saving workbook not needed if using matchgas
    'sob.getSheet().parent.Close False
    
End Sub


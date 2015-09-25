Attribute VB_Name = "Settings_"
Option Explicit
Const SETTINGS_KEY = "gmailExample"

' // one off settings to get started
Public Sub setOneTimeProperties()
    setProperties oneTimeSettings()
End Sub
Public Function oneTimeSettings() As KVPairs

    Dim kv As KVPairs
    Set kv = New KVPairs

    kv.add "KEY", SETTINGS_KEY
    
    kv.add "LOOKUP.ID", "c:/users/bruce/Documents/Excel/gmailCarriers.xlsx"
    kv.add "LOOKUP.NAME", "lookup"
 
    kv.add "THREADS.AFTER", DateSerial(2015, 8, 12)
    kv.add "THREADS.LABEL", "flight club submissions"
    kv.add "THREADS.IN", "inbox"
    kv.add "THREADS.PHRASE", "flight club"
    kv.add "THREADS.FLAG", "Complete"
    
    kv.add "HEADINGS.CODE", "carrier"
    kv.add "HEADINGS.NAME", "name"
    
    kv.add "PATHS.ARCHIVE", "C:/Users/Bruce/Google Drive/books/going gas/gmailexample/archive/"
    
    kv.add "COURSES.FLIGHTS.CALENDAR", "course calendar"
    kv.add "COURSES.FLIGHTS.NAME", "flight club"
    kv.add "COURSES.FLIGHTS.DELAY", 21
    kv.add "COURSES.FLIGHTS.HORIZON", 100
    
    kv.add "COURSES.CONTACTS.GROUP", "flight club contacts"
    
    kv.add "GAS.URL", "https://script.google.com/macros/s/AKfycbyHehh2LjOtDovKZQXTreZLPonau-KA1wL2xgKxK_2B83ENZ07m/exec"
    Set oneTimeSettings = kv
End Function

'//after setting up, they would come form the registry
Private Sub setProperties(props As KVPairs)
    Dim kv As Variant
    
    ' write to registry
    For Each kv In props.getPairs()
        SaveSetting SETTINGS_KEY, "settings", VBA.CStr(kv(1)), kv(2)
    Next kv

End Sub

'//after setting up, they would come from the registry
Public Function getProperties() As KVPairs

    Dim kv As Variant, a As Variant, i As Long
    Set kv = New KVPairs
    ' read from registry
    a = GetAllSettings(SETTINGS_KEY, "settings")
    For i = LBound(a, 1) To UBound(a, 1)
        kv.add CStr(a(i, 0)), a(i, 1)
    Next i
    Set getProperties = kv
End Function


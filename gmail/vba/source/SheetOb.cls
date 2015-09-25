VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "SheetOb"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit
Private sheet_ As Worksheet
Private app_ As Excel.Application
Private listObject_ As ListObject
Public Function sheetOpen(path, sheetName, Optional readOnly As Boolean = True) As SheetOb
    ' open the workbook
    Set sheet_ = app_.Workbooks.Open(path, , readOnly).Sheets(sheetName)
    Set sheetOpen = Me
End Function
Public Function getSheet() As Worksheet
    Set getSheet = sheet_
End Function
Public Function refresh() As SheetOb

    ' if list object is not set up, then make one
    If (sheet_.ListObjects.Count = 0) Then
        sheet_.ListObjects.add(xlSrcRange, sheet_.UsedRange, , xlYes).name = "airlineLookup"
    End If
    
    'assuming only one the sheet for simplicity
    Set listObject_ = sheet_.ListObjects(1)
    Set refresh = Me
End Function
Public Function getData() As ListObject
    ' if its first time called then get the data
    If (listObject_ Is Nothing) Then
        refresh
    End If
    Set getData = listObject_
End Function
Private Sub Class_Initialize()
    Set app_ = New Excel.Application
End Sub

Attribute VB_Name = "FilePaths_"
Option Explicit

Public Function getFolderFromPath(path As String, Optional create As Boolean = False) As Object
    Dim fSys As Object, splitPath As Variant, i As Long, iter As Object
    
    ' can take a folder or use the fs object
    Set fSys = getSysObj()
    
    ' forward/backward clean up
    path = replace(path, "/", "\")
    
    ' create the tree if needed
    If (Not fSys.FolderExists(path) And create) Then
    
        ' need to iterate on this
        splitPath = Split(path, "\")

        For i = LBound(splitPath) To UBound(splitPath)
            ' join with the current path
            path = splitPath(i)
            If (Not iter Is Nothing) Then path = iter.path & "\" & path
            If (Not fSys.FolderExists(path)) Then
                fSys.CreateFolder (path)
            End If
            Set iter = fSys.getFolder(path)
        Next i

    End If
    
    Set getFolderFromPath = fSys.getFolder(path)
    
End Function
Private Function getSysObj() As Object
    Set getSysObj = CreateObject("Scripting.FileSystemObject")
End Function


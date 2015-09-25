VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "KVPairs"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit
Private pairs_ As Collection
' key values are represented as a 2 element array and stored in a collection
' this avoids XML or JSON manipulation in VBA
Private Function makePair(Key As String, value As Variant) As Variant
    Dim kv As Variant
    ReDim kv(1 To 2)
    kv(1) = Key
    If (IsObject(value)) Then
        Set kv(2) = value
    Else
        kv(2) = value
    End If
    makePair = kv
End Function
Public Function exists(Key As Variant) As Boolean
    On Error GoTo flop
    Dim k As String
    k = getKey(Key)
    exists = True
    Exit Function
    
flop:
    exists = False
    Exit Function
End Function
Public Function add(Key As String, value As Variant) As KVPairs
    Dim kv As Variant
    kv = makePair(Key, value)
    pairs_.add kv, VBA.LCase(Key)
End Function
Public Function replace(Key As String, value As Variant) As KVPairs
    Dim kv As Variant
    kv = makePair(Key, value)
    
    ' delete the old
    If exists(Key) Then
        pairs_.remove (VBA.LCase(Key))
    End If
    
    ' add the new
    pairs_.add kv, VBA.LCase(Key)

End Function
Public Function getPairs() As Collection
    Set getPairs = pairs_
End Function
Private Function getVKey(Key As Variant) As Variant
    
    ' if its not a numeric key, then make it lower case
    If (TypeName(Key) <> TypeName("s")) Then
        getVKey = Int(Key)
    Else
        getVKey = VBA.LCase(Key)
    End If
    
End Function
Public Function getValue(Key As Variant) As Variant
    Dim vKey As Variant
    vKey = getVKey(Key)
    
    ' just whether to use set to make vba syntax right
    If IsObject(pairs_(vKey)(2)) Then
        Set getValue = pairs_(vKey)(2)
    Else
        getValue = pairs_(vKey)(2)
    End If
    
End Function
Public Function getKey(Key As Variant) As String
    Dim vKey As Variant
    
    ' this seems pointless but it allows getting the value of a key by its index number
    getKey = pairs_(getVKey(Key))(1)
    
End Function
Public Function getKeys() As Collection
    Dim co As Collection
    Set co = New Collection
    Dim i As Long
    
    ' returns all the keys so it can be used like object.keys
    For i = 1 To getPairs.Count
        co.add getKey(i)
    Next i

    Set getKeys = co
End Function
Private Sub Class_Initialize()
    Set pairs_ = New Collection
End Sub

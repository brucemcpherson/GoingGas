Attribute VB_Name = "Utils_"
Option Explicit
' /**
'  * execute a regex and return the single match
'  * @param {Regexp} rx the regexp
'  * @param {string} source the source string
'  * @param {string} def the default value
'  * @return {string} the match
'  */
Public Function getMatchPiece(rx As RegExp, source As String, Optional def As Variant) As Variant
    Dim f  As MatchCollection, result As Variant
    Set f = rx.Execute(source)
    If (f.Count > 0) Then
        result = f.item(1)
    Else
        result = def
    End If
    
    If (TypeName(def) = TypeName(True)) Then
        result = yesish(result)
    End If
    getMatchPiece = result
    
End Function
Private Function yesish(s As Variant) As Boolean
    Dim t As String
    t = LCase(CStr(s))
    yesish = t = "yes" Or t = "y" Or t = "true" Or t = "1"
End Function
Public Function encodeURI(content As String) As String
    Dim s As String, result As String, p As Long
    p = 0
    result = ""
    

    
    While p < Len(content)
        p = p + 1
        s = Mid(content, p, 1)

        ' these are not escaped
        If s Like "[a-zA-Z0-9\-_.!~*'()]" Then
            result = result & s
        
        ' space becomes +
        ElseIf s = " " Then
            result = result & "+"
        
        'odd ones become hex value with leading 0
        Else
            result = result & "%" & Right("0" & Hex(Asc(s)), 2)
        End If
        
    Wend
    encodeURI = result
End Function

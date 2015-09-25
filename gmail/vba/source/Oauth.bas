Attribute VB_Name = "Oauth"
Option Explicit
Public Function getGoogled(scope As String, _
                                Optional replacementpackage As cJobject = Nothing, _
                                Optional clientID As String = vbNullString, _
                                Optional clientSecret As String = vbNullString, _
                                Optional complain As Boolean = True, _
                                Optional cloneFromeScope As String = vbNullString) As cOauth2
    Dim o2 As cOauth2
    Set o2 = New cOauth2
    With o2.googleAuth(scope, replacementpackage, clientID, clientSecret, complain, cloneFromeScope)
        If Not .hasToken And complain Then
            MsgBox ("Failed to authorize to google for scope " & scope & ":denied code " & o2.denied)
        End If
    End With
    
    Set getGoogled = o2
End Function


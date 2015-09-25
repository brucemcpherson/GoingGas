VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "cOauth2"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'gistThat@mcpher.com :do not modify this line - see ramblings.mcpher.com for details: updated on 8/18/2014 3:54:14 PM : from manifest:5055578 gist https://gist.github.com/brucemcpherson/6937450/raw/cOauth2.cls
Option Explicit
'" based on Kyle Beachill Oauth2
'" for credits and details see
'" http://ramblings.mcpher.com/Home/excelquirks/guests/oauth2
' for details on this implementation see http://ramblings.mcpher.com/Home/excelquirks/googleoauth2
' v1.5

Private pPackage As cJobject
Private pCb As cBrowser
Private pDialog  As cJobject
Private pSalt As String
Private pMessage As String

Public Function googleAuth(scopeEntry As String, _
        Optional replacementConsole As cJobject = Nothing, _
        Optional clientID As String = vbNullString, _
        Optional clientSecret As String = vbNullString, _
        Optional complain As Boolean = True, _
        Optional cloneFromScopeEntry As String = vbNullString) As cOauth2
    
    ' this will do an oauth2 against google - the generated token() is usuable for subsequent requests against the given scope
    ' a auth interactive dialog wont be necessary if there is a refresh token, or an unexpired auth token
    ' available in the registry for this user.
    ' All data in registry is encrypted, and package from the last access is stored there
    ' this mimics the behavior of sites that authorized against google credentials
    
    ' setting up for the fist time.
    ' the first time this is used, there is nothing in the registry, so this needs to be called with either
    ' a cJobject which is simply the JSONPARSE of the string you can download from google when you register an app
    ' or, the clientID and client secret
    ' or you can clone all this from another scope
    ' once this has ever been called, the registry is used for the source of all this.
    
    ' refreshing the registry
    ' if for any reason the registry is stale, just repeat as if setting up for the first time
    Dim authFlavor As String, aKey As String, sKey As String, clonePackage As cJobject
    authFlavor = "google"
    aKey = "type_" & authFlavor
    sKey = "scope_" & scopeEntry
    
    Set googleAuth = Me
    
    ' first see if we are cloning from another scope
    If (cloneFromScopeEntry <> vbNullString) Then
        Set clonePackage = getRegistryPackage(aKey, "scope_" & cloneFromScopeEntry)
    End If
    
    If (clientID <> vbNullString Or clientSecret <> vbNullString Or Not replacementConsole Is Nothing _
        Or Not clonePackage Is Nothing) Then
        ' need a refresh
        If (clonePackage Is Nothing) Then
            Set pPackage = googlePackage(replacementConsole)
        Else
            ' use the cloned credentials, but revoke it to force a new authentication
            Set pPackage = clonePackage
            revoke
        End If
        ' use replacement package and add any passwords passed over (they may already be in the package)
        With pPackage.child("parameters")
            If clientSecret <> vbNullString Then .add "client_secret", clientSecret
            If clientID <> vbNullString Then .add "client_id", clientID
            .add "authFlavor", aKey
            .add "scopeEntry", sKey
        End With
        
    Else
        ' get existing ppackage from registry if there is one
        Set pPackage = getRegistryPackage(aKey, sKey)
        If (pPackage Is Nothing) Then
            pMessage = "need to supply new credentials - nothing in registry"
            Exit Function
        End If
    
    End If
    ' this looks up the URL for the given scope entry
    addGoogleScope (scopeEntry)
    
    ' do the auth
    If (Not hasRefreshToken) Then
'        " first step is to either get user consent and get a new token
        getUserConsent
'        " now get an access token
        Set googleAuth = getToken
    
    ElseIf (isExpired) Then
'        " or to refresh an old one
        Set googleAuth = getToken("refresh_token")
        
    Else
    
'        " or we are already good
        Set googleAuth = Me
    End If
    
'    " update registry package
    setRegistryPackage
    

End Function
'" do we have a token
Public Property Get hasToken() As Boolean
    hasToken = token <> ""
End Property
' the auth header
Public Property Get authHeader() As String
    If hasToken Then authHeader = tokenType & " " & token
End Property
'" the token
Public Property Get token() As String
    token = getItemValue("parameters.access_token")
End Property
'" the denied error
Public Property Get denied() As String
    denied = getItemValue("parameters.deniedCode") & pMessage
End Property
Private Function revoke() As cOauth2
    With pPackage.child("parameters")
        .add "access_token", vbNullString
        .add "refresh_token", vbNullString
        .add "code", vbNullString
    End With
    Set revoke = Me
End Function
'" the first phase - get user consent to proceed
Private Function getUserConsent() As cOauth2

    If pCb Is Nothing Then
        Set pCb = New cBrowser
    End If
    Dim phase As String
    phase = "userConsent"
    
    With pCb
        .Init().Navigate _
            createUrl(phase) & "?" & generatePhaseParameters(phase), True
'        " store results
        With pPackage.child("parameters")
            .add "code", pCb.successCode
            .add "deniedCode", pCb.deniedCode
        End With
    End With
    
    Set getUserConsent = Me
End Function

'" if we got user consent, then we can go ahead and get an access token
Private Function getToken(Optional phase As String = "authorization_code") As cOauth2

    Dim job As cJobject, joc As cJobject

    If isAuthenticated Then
        If pCb Is Nothing Then
            Set pCb = New cBrowser
        End If
        
        pPackage.child("parameters").add "grant_type", phase
        pCb.httpPost createUrl(phase), generatePhaseParameters(phase)
        With pPackage.child("parameters")
            If (pCb.status <> 200) Then
                revoke
                .add "deniedCode", pCb.status

            Else
                Set job = JSONParse(pCb.Text)

                For Each joc In job.children
                    .add joc.Key, joc.value
                Next joc
                If hasRefreshToken Then
                    .add "expires", addSeconds(now(), expiresIn)
                End If

            End If
        End With
    End If
    Set getToken = Me
    
End Function
Private Function addSeconds(d As Date, n As Long) As Date
    addSeconds = DateAdd("s", n, d)
End Function
'" - none of these need to be exposed --
'" do we have user consent
Private Property Get isAuthenticated() As Boolean
    isAuthenticated = code <> ""
End Property

Private Property Get tokenType() As String
    tokenType = getItemValue("parameters.token_type")
End Property
Private Property Get expiresIn() As Long
    expiresIn = getItemValue("parameters.expires_in")
End Property
Private Property Get expires() As Date
    expires = getItemValue("parameters.expires")
End Property
'" the user consent
Private Property Get code() As String
    code = getItemValue("parameters.code")
End Property
Private Property Get hasRefreshToken() As Boolean
    hasRefreshToken = refreshToken <> vbNullString
End Property
Private Property Get isExpired() As Boolean
    isExpired = addSeconds(now(), 660) > expires
    
End Property

'" the refresh token
Private Property Get refreshToken() As String
    refreshToken = getItemValue("parameters.refresh_token")
End Property
Private Function getItemValue(Key As String) As String
    On Error GoTo crapped
        If Not pPackage Is Nothing Then
            getItemValue = pPackage.child(Key).toString
        Else
            getItemValue = vbNullString
        End If
        Exit Function
crapped:
    getItemValue = vbNullString
End Function
Private Function createUrl(parameterType As String) As String
    createUrl = getItemValue("parameters." & pDialog.child(parameterType).toString("url"))
End Function

Private Function generatePhaseParameters(whichPhase As String) As String
    Dim joc As cJobject, s As cStringChunker
'    " this will construct a parameterstring for everything needed for an authentication phase
    Set s = New cStringChunker
    With pDialog.child(whichPhase).child("parameters")
       For Each joc In .children
           With pPackage.child("parameters").child(joc.value)
               If (.toString <> vbNullString) Then
                   s.add(.Key).add("=").add(.toString).add ("&")
               End If
           End With
       Next joc
    End With
    generatePhaseParameters = s.chopIf("&").content
    Set s = Nothing
End Function

'" release up memory - should be called when done
Public Function tearDown() As cOauth2
    If (Not pPackage Is Nothing) Then
        pPackage.tearDown
        Set pPackage = Nothing
    End If
    If (Not pDialog Is Nothing) Then
        pDialog.tearDown
        Set pDialog = Nothing
    End If
    If (Not pCb Is Nothing) Then
        pCb.tearDown
        Set pCb = Nothing
    End If
    Set tearDown = Me
End Function

'"---- encryption ----
Public Property Let salt(p As String)
'    " you can change the encrypt salt if necessary
    pSalt = p
End Property
Private Function encrypt(s As String) As String
'   encryptin not needed for registry
    encrypt = s
End Function
Private Function decrypt(s As String) As String
'   encryptin not needed for registry
    decrypt = s
End Function
'" ---- registry -----
'" in registry entries, the values are encrypted useing the salt
'" the structure is
'" xLiberation/googleAuth/scope - json pPackage values
Private Function getRegistryPackage(authFlavor As String, scopeEntry As String) As cJobject
    Dim s As String
    s = GetSetting("xLiberation", _
            authFlavor, _
            scopeEntry)
    
    If (s <> vbNullString) Then Set getRegistryPackage = JSONParse(decrypt(s))
End Function
Private Function setRegistryPackage() As cJobject
    Dim s As String
    s = JSONStringify(pPackage)
    SaveSetting "xLiberation", _
            getItemValue("parameters.authFlavor"), _
            getItemValue("parameters.scopeEntry"), _
            encrypt(s)
            
End Function
Private Function describeDialog() As cJobject
    Set describeDialog = JSONParse( _
    "{'userConsent':" & _
        "{'url':'url','parameters':" & _
            "['response_type','token_uri','redirect_uri','client_id','scope']}," & _
    "'authorization_code':{'url':'token_uri','parameters':['code','client_id'," & _
    "'client_secret','redirect_uri','grant_type']}," & _
    "'refresh_token':{'url':'refresh_uri','parameters'" & _
    ":['refresh_token','client_id','client_secret','grant_type']}}")
     
End Function
'" this is the package describing google oauth2
Private Function googlePackage(Optional consolePackage As cJobject = Nothing) As cJobject
    Dim job As cJobject, package As cJobject, p As cJobject, c As cJobject

    ' use data provided or create an empty one
    If consolePackage Is Nothing Then
        Set job = makeBasicGoogleConsole()
    Else
        Set job = consolePackage
    End If
    
    Set package = skeletonPackage
    Set c = job.child("installed")
    Set p = package.child("parameters")
    
    addFromOther c, p, "url", "auth_uri"
    addFromOther c, p, "token_uri"
    p.add "response_type", "code"
    p.add "redirect_uri", c.child("redirect_uris.1").value
    addFromOther c, p, "client_id"
    addFromOther c, p, "client_secret"
    addFromOther c, p, "refresh_uri", "token_uri"
    p.add "grant_type", "authorization_code"

    
    Set googlePackage = package
    If (consolePackage Is Nothing) Then job.tearDown
    
End Function
Private Sub addFromOther(c As cJobject, p As cJobject, k As String, Optional ok As String = vbNullString)
    If ok = vbNullString Then ok = k
    With p
        If Not c.childExists(ok) Is Nothing Then
            .add k, c.child(ok).value
        Else
            .add k
        End If
    End With
End Sub
Public Function addGoogleScope(s As String) As cOauth2
    

    With pPackage.child("parameters")
        Select Case s
            Case "analytics"
                .add "scope", URLEncode("https://www.googleapis.com/auth/analytics.readonly")
            
            Case "drive"
                .add "scope", URLEncode("https://www.googleapis.com/auth/drive")
                
            Case "feeds"
                .add "scope", URLEncode("https://spreadsheets.google.com/feeds")
                
            Case "viz"
                .add "scope", URLEncode("https://spreadsheets.google.com/feeds") + "+" & _
                     URLEncode("https://www.googleapis.com/auth/drive")
            
            Case "urlshortener"
                .add "scope", URLEncode("https://www.googleapis.com/auth/urlshortener")
                
                
            Case Default
                Debug.Assert False
        End Select
    End With
    Set addGoogleScope = Me
End Function

Private Function makeBasicGoogleConsole() As cJobject
    Dim consoleJSON As String
'    " when you register your app with google, you can download the Json
    
    consoleJSON = _
"{'installed':{'auth_uri':'https://accounts.google.com/o/oauth2/auth'," & _
  "'token_uri':'https://accounts.google.com/o/oauth2/token'," & _
  "'redirect_uris':['urn:ietf:wg:oauth:2.0:oob','oob']," & _
  "'auth_provider_x509_cert_url':'https://www.googleapis.com/oauth2/v1/certs'}}"

'  " then parse it
  Set makeBasicGoogleConsole = JSONParse(consoleJSON)
End Function
Public Function skeletonPackage() As cJobject
    Dim package As cJobject
    Set package = New cJobject
    With package.Init(Nothing)
        With .add("parameters")
            .add "url"
            .add "token_uri"
            .add "response_type"
            .add "redirect_uri"
            .add "client_id"
            .add "code"
            .add "client_secret"
            .add "refresh_uri"
            .add "grant_type"
            .add "scope"
            .add "authFlavor"
            .add "scopeEntry"
            .add "deniedCode"
        End With
    End With
    Set skeletonPackage = package
End Function


Private Sub Class_Initialize()
    Set pDialog = describeDialog
    pSalt = "xLiberation"
End Sub











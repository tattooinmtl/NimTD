Option Explicit

Dim shell, files, appDir, electronExe, exitCode
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
appDir = files.GetParentFolderName(WScript.ScriptFullName)
electronExe = appDir & "\node_modules\electron\dist\electron.exe"
shell.CurrentDirectory = appDir

If Not files.FileExists(electronExe) Then
  shell.Popup "NimTD is installing its Electron runtime. This first launch may take a moment.", 4, "NimTD Setup", 64
  exitCode = shell.Run("cmd /c npm install", 0, True)
  If exitCode <> 0 Or Not files.FileExists(electronExe) Then
    shell.Popup "NimTD could not install its Electron runtime. Run npm install from the NimTD folder and try again.", 0, "NimTD Setup Error", 16
    WScript.Quit 1
  End If
End If

shell.Environment("Process").Remove "ELECTRON_RUN_AS_NODE"
shell.Run """" & electronExe & """ .", 1, False

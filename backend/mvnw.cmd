@echo off
@REM Maven Wrapper for Windows — uses local Maven installation
@setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"

@REM Find JAVA_HOME
if "%JAVA_HOME%"=="" (
    for /d %%d in ("C:\Program Files\Microsoft\jdk-21*") do set "JAVA_HOME=%%d"
)

if "%JAVA_HOME%"=="" (
    echo Error: JAVA_HOME not found. Install JDK 21 or set JAVA_HOME.
    exit /b 1
)

set "MVN_CMD=%MAVEN_PROJECTBASEDIR%.mvn\apache-maven-3.9.9\bin\mvn.cmd"

if not exist "%MVN_CMD%" (
    echo Maven not found. Downloading Maven 3.9.9...
    set "MVN_ZIP=%MAVEN_PROJECTBASEDIR%.mvn\maven.zip"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip' -OutFile '%MVN_ZIP%'"
    powershell -Command "Expand-Archive -Path '%MVN_ZIP%' -DestinationPath '%MAVEN_PROJECTBASEDIR%.mvn' -Force"
    del "%MVN_ZIP%"
)

call "%MVN_CMD%" %*

@endlocal

set "path=%cd%"
set "drive=%path:~0,1%:"
C:
cd C:\Program Files\MongoDB\Server\3.2\bin

mongod.exe

%drive%
cd %path%

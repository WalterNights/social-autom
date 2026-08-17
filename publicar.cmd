@echo off
REM Lanzador para el Programador de tareas de Windows.
REM Se ubica solo en su propia carpeta, asi la tarea programada
REM funciona sin importar desde donde se invoque.
cd /d "%~dp0"
call npm run publish -- --ask >> publish.log 2>&1

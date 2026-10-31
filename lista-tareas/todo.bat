@echo off
title Listado de Tareas
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0todo.ps1" %*
if "%~1"=="" pause


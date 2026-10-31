param (
    [string]$Comando = "",
    [string]$Texto = "",
    [string]$Prioridad = "Media"
)

$ArchivoTareas = Join-Path $PSScriptRoot "tareas.json"

function Cargar-Tareas {
    if (Test-Path $ArchivoTareas) {
        try {
            $raw = Get-Content $ArchivoTareas -Raw -Encoding UTF8
            if (-not [string]::IsNullOrWhiteSpace($raw)) {
                $datos = $raw | ConvertFrom-Json
                return @($datos)
            }
        } catch {
            return @()
        }
    }
    return @()
}

function Guardar-Tareas($tareas) {
    @($tareas) | ConvertTo-Json -Depth 5 | Set-Content $ArchivoTareas -Encoding UTF8
}

function Mostrar-Tareas {
    $tareas = @(Cargar-Tareas)
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "            LISTADO DE TAREAS             " -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
    
    if ($tareas.Count -eq 0) {
        Write-Host "`nNo tienes tareas registradas actualmente.`n" -ForegroundColor DarkGray
        return
    }

    $completadas = @($tareas | Where-Object { $_.Completada -eq $true }).Count
    $total = $tareas.Count
    $pct = if ($total -gt 0) { [math]::Round(($completadas / $total) * 100) } else { 0 }
    Write-Host "Progreso: $completadas/$total ($($pct)%) completadas`n" -ForegroundColor Green

    for ($i = 0; $i -lt $tareas.Count; $i++) {
        $t = $tareas[$i]
        $num = ($i + 1).ToString().PadLeft(2)
        $icono = if ($t.Completada) { "[X]" } else { "[ ]" }
        $color = if ($t.Completada) { "DarkGray" } else { "White" }
        
        $prioColor = switch ($t.Prioridad) {
            "Alta"  { "Red" }
            "Media" { "Yellow" }
            "Baja"  { "Green" }
            Default { "Gray" }
        }

        $iconoColor = if ($t.Completada) { "Green" } else { "DarkYellow" }
        Write-Host "$num. $icono " -NoNewline -ForegroundColor $iconoColor
        Write-Host "$($t.Titulo) " -NoNewline -ForegroundColor $color
        Write-Host "[$($t.Prioridad)]" -ForegroundColor $prioColor
    }
    Write-Host ""
}

function Agregar-Tarea($titulo, $prio = "Media") {
    if ([string]::IsNullOrWhiteSpace($titulo)) {
        Write-Host "El titulo de la tarea no puede estar vacio." -ForegroundColor Red
        return
    }
    $tareas = @(Cargar-Tareas)
    $nueva = [PSCustomObject]@{
        Id = (Get-Date -Format "yyyyMMddHHmmssfff")
        Titulo = $titulo
        Prioridad = $prio
        Completada = $false
        FechaCreacion = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
    $tareas += $nueva
    Guardar-Tareas $tareas
    Write-Host "Tarea agregada con exito: '$titulo'" -ForegroundColor Green
}

function Alternar-Tarea($indice) {
    $tareas = @(Cargar-Tareas)
    $idx = $indice - 1
    if ($idx -ge 0 -and $idx -lt $tareas.Count) {
        $tareas[$idx].Completada = -not $tareas[$idx].Completada
        $estado = if ($tareas[$idx].Completada) { "completada" } else { "pendiente" }
        Guardar-Tareas $tareas
        Write-Host "Tarea marcada como $estado." -ForegroundColor Green
    } else {
        Write-Host "Numero de tarea no valido." -ForegroundColor Red
    }
}

function Eliminar-Tarea($indice) {
    $tareas = @(Cargar-Tareas)
    $idx = $indice - 1
    if ($idx -ge 0 -and $idx -lt $tareas.Count) {
        $eliminada = $tareas[$idx].Titulo
        $nuevas = @($tareas | Where-Object { $_ -ne $tareas[$idx] })
        Guardar-Tareas $nuevas
        Write-Host "Tarea eliminada: '$eliminada'" -ForegroundColor Yellow
    } else {
        Write-Host "Numero de tarea no valido." -ForegroundColor Red
    }
}

# Modo linea de comandos directa
if ($Comando -ne "") {
    switch ($Comando.ToLower()) {
        "list" { Mostrar-Tareas; exit }
        "add"  { Agregar-Tarea $Texto $Prioridad; exit }
        "done" { Alternar-Tarea ([int]$Texto); exit }
        "rm"   { Eliminar-Tarea ([int]$Texto); exit }
    }
}

# Modo Interactivo de Menu
while ($true) {
    Mostrar-Tareas
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "  1. Agregar nueva tarea"
    Write-Host "  2. Marcar/desmarcar tarea como completada"
    Write-Host "  3. Eliminar tarea"
    Write-Host "  4. Salir"
    $opcion = Read-Host "`nSelecciona una opcion (1-4)"

    switch ($opcion) {
        "1" {
            $t = Read-Host "Titulo de la tarea"
            Write-Host "Prioridad: (1) Alta, (2) Media, (3) Baja"
            $pNum = Read-Host "Elige prioridad (Enter = Media)"
            $p = switch ($pNum) {
                "1" { "Alta" }
                "3" { "Baja" }
                Default { "Media" }
            }
            Agregar-Tarea $t $p
            Start-Sleep -Seconds 1
        }
        "2" {
            $n = Read-Host "Numero de tarea a marcar/desmarcar"
            Alternar-Tarea ([int]$n)
            Start-Sleep -Seconds 1
        }
        "3" {
            $n = Read-Host "Numero de tarea a eliminar"
            Eliminar-Tarea ([int]$n)
            Start-Sleep -Seconds 1
        }
        "4" {
            Write-Host "Hasta pronto!" -ForegroundColor Cyan
            break
        }
        Default {
            Write-Host "Opcion invalida." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}

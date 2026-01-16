# Datenbank-Setup Anleitung

## ✅ Abgeschlossene Schritte

1. ✅ PostgreSQL-Paket (`pg`) installiert
2. ✅ Datenbankverbindungsdatei erstellt (`src/lib/database.ts`)
3. ✅ API-Routen für Tasks auf Datenbank umgestellt
4. ✅ API-Routen für Besprechungen auf Datenbank umgestellt
5. ✅ SQL-Schemas erstellt

## 📋 Nächste Schritte

### 1. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei im Projekt-Root mit folgendem Inhalt:

```env
DATABASE_URL=postgresql://neondb_owner:npg_QANlHW5jJM2F@ep-billowing-wind-ag4tpv5n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Wichtig:** Die `.env.local` Datei ist bereits in `.gitignore` und wird nicht ins Repository committed.

### 2. Datenbank-Schema erstellen

Führen Sie die folgenden SQL-Skripte in Ihrem Neon SQL Editor aus:

#### a) Basis-Schema (falls noch nicht vorhanden)
Führen Sie `database_complete.sql` aus, um alle Basis-Tabellen zu erstellen.

#### b) Besprechungen-Schema
Führen Sie `database_besprechungen.sql` aus, um die Tabellen für Besprechungen, Besprechungspunkte und Erledigungsvermerke zu erstellen.

#### c) Jour-fixe Schema (optional)
Führen Sie `database_jour_fixe.sql` aus, um die Tabelle für Jour-fixe Einträge zu erstellen.

### 3. Server neu starten

Nach dem Erstellen der `.env.local` Datei, starten Sie den Development-Server neu:

```bash
npm run dev
```

## 📊 Datenbankstruktur

### Tabellen

- **tasks** - Aufgaben
- **besprechungen** - Besprechungen
- **besprechungspunkte** - Besprechungspunkte
- **erledigungsvermerke** - Erledigungsvermerke zu Besprechungspunkten
- **jour_fixe_entries** - Jour-fixe Einträge (optional)

### API-Routen

Alle API-Routen verwenden jetzt die echte Datenbank:

- `GET /api/tasks` - Alle Aufgaben abrufen
- `POST /api/tasks` - Neue Aufgabe erstellen
- `PATCH /api/tasks/[id]` - Aufgabe aktualisieren
- `DELETE /api/tasks` - Aufgabe löschen
- `GET /api/besprechungen` - Alle Besprechungen abrufen
- `POST /api/besprechungen` - Neue Besprechung erstellen
- `PUT /api/besprechungen` - Besprechung aktualisieren
- `DELETE /api/besprechungen` - Besprechung löschen

## 🔍 Fehlerbehebung

### Verbindungsfehler

Wenn Sie Verbindungsfehler erhalten:

1. Überprüfen Sie, ob die `.env.local` Datei existiert und korrekt ist
2. Überprüfen Sie, ob die DATABASE_URL korrekt ist
3. Stellen Sie sicher, dass der Neon-Datenbank-Server erreichbar ist
4. Überprüfen Sie die Firewall-Einstellungen in Neon

### Tabellen nicht gefunden

Wenn Sie Fehler wie "relation does not exist" erhalten:

1. Führen Sie die SQL-Skripte in der richtigen Reihenfolge aus
2. Überprüfen Sie, ob alle Tabellen in der Datenbank existieren
3. Überprüfen Sie die Tabellennamen (Groß-/Kleinschreibung beachten)

## 📝 Notizen

- Die Datenbankverbindung verwendet einen Connection Pool für bessere Performance
- Alle Timestamps werden automatisch von PostgreSQL verwaltet
- Foreign Keys mit CASCADE DELETE sorgen für automatische Bereinigung

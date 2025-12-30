const fs = require('fs');
const path = require('path');

// Alle API-Routen finden, die noch Datenbankverbindungen haben
const apiDir = path.join(__dirname, '../src/app/api');

function findRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findRouteFiles(filePath));
    } else if (file === 'route.ts') {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('neon') || content.includes('DATABASE_URL')) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

const routeFiles = findRouteFiles(apiDir);

console.log(`Gefundene Dateien mit Datenbankverbindungen: ${routeFiles.length}`);

routeFiles.forEach(file => {
  console.log(`  - ${file}`);
});

console.log('\nHinweis: Diese Dateien müssen manuell angepasst werden, um Mock-Daten zurückzugeben.');








const fs = require('fs');
const path = 'c:/Users/jesus/sistema-redimain/app/api/map/[layer]/route.ts';

let content = fs.readFileSync(path, 'utf8');

// 1. Agregar force-dynamic al principio
if (!content.includes("export const dynamic = 'force-dynamic';")) {
  content = content.replace(
    "import { supabase } from '@/app/lib/supabase';",
    "import { supabase } from '@/app/lib/supabase';\n\nexport const dynamic = 'force-dynamic';"
  );
}

// 2. Vaciar todos los arrays de MOCK DATA
content = content.replace(/const MOCK_PUNTOS_INTERES = \[[\s\S]*?\];/g, 'const MOCK_PUNTOS_INTERES: any[] = [];');
content = content.replace(/const MOCK_PERSONAS_INTERES = \[[\s\S]*?\];/g, 'const MOCK_PERSONAS_INTERES: any[] = [];');
content = content.replace(/const MOCK_REPORTE_SUSTANCIAS = \[[\s\S]*?\];/g, 'const MOCK_REPORTE_SUSTANCIAS: any[] = [];');
content = content.replace(/const MOCK_USUARIOS_MAESTRA = \[[\s\S]*?\];/g, 'const MOCK_USUARIOS_MAESTRA: any[] = [];');
content = content.replace(/const MOCK_INCIDENCIAS = \[[\s\S]*?\];/g, 'const MOCK_INCIDENCIAS: any[] = [];');
content = content.replace(/const MOCK_INCIDENCIAS_MANIFESTACIONES = \[[\s\S]*?\];/g, 'const MOCK_INCIDENCIAS_MANIFESTACIONES: any[] = [];');
content = content.replace(/const MOCK_BANDAS = \[[\s\S]*?\];/g, 'const MOCK_BANDAS: any[] = [];');
content = content.replace(/const MOCK_ZONAS_BANDAS = \[[\s\S]*?\];/g, 'const MOCK_ZONAS_BANDAS: any[] = [];');

fs.writeFileSync(path, content, 'utf8');
console.log('route.ts arreglado con exito.');

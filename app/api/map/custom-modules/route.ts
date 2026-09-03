import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MODULES_DIR = path.join(process.cwd(), 'public', 'custom_modules');
const REGISTRY_FILE = path.join(MODULES_DIR, 'modules.json');

function ensureModulesDir() {
  if (!fs.existsSync(MODULES_DIR)) {
    fs.mkdirSync(MODULES_DIR, { recursive: true });
  }
  if (!fs.existsSync(REGISTRY_FILE)) {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function getModulesList(): any[] {
  ensureModulesDir();
  try {
    const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo modules.json:', err);
    return [];
  }
}

function saveModulesList(modules: any[]) {
  ensureModulesDir();
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(modules, null, 2), 'utf8');
}

// GET: Obtener todos los módulos personalizados
export async function GET() {
  try {
    const modules = getModulesList();
    return NextResponse.json(modules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Registrar un nuevo módulo personalizado y guardar su archivo GeoJSON
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, color, icon, description, geojson } = body;

    if (!name || !geojson) {
      return NextResponse.json({ error: 'Falta el nombre o el contenido GeoJSON del módulo' }, { status: 400 });
    }

    ensureModulesDir();

    // Generar un ID único tipo slug
    const id = `mod_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20)}`;
    const geojsonFileName = `${id}.geojson`;
    const geojsonFilePath = path.join(MODULES_DIR, geojsonFileName);

    // Guardar archivo GeoJSON en el disco público
    fs.writeFileSync(geojsonFilePath, JSON.stringify(geojson, null, 2), 'utf8');

    // Registrar metadatos del nuevo módulo
    const modules = getModulesList();
    const newModule = {
      id,
      name,
      category: category || 'Módulo Principal',
      color: color || '#06b6d4',
      icon: icon || 'Layers',
      description: description || '',
      geojsonUrl: `/custom_modules/${geojsonFileName}`,
      featuresCount: geojson.features?.length || 0,
      createdAt: new Date().toISOString(),
    };

    modules.push(newModule);
    saveModulesList(modules);

    return NextResponse.json({ success: true, module: newModule });
  } catch (error: any) {
    console.error('Error creando módulo personalizado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un módulo personalizado
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del módulo a eliminar' }, { status: 400 });
    }

    ensureModulesDir();
    let modules = getModulesList();
    const targetModule = modules.find(m => m.id === id);

    if (targetModule) {
      // Eliminar el archivo .geojson si existe
      const geojsonPath = path.join(MODULES_DIR, `${id}.geojson`);
      if (fs.existsSync(geojsonPath)) {
        fs.unlinkSync(geojsonPath);
      }
      modules = modules.filter(m => m.id !== id);
      saveModulesList(modules);
    }

    return NextResponse.json({ success: true, remaining: modules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

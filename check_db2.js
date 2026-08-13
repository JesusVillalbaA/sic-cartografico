import { supabase } from './src/lib/supabase.js';

async function check() {
  const { data: incidencias, error: err1 } = await supabase.from('incidencias').select('categoria_incidencia, tipo_incidente');
  console.log('Incidencias Categories:', [...new Set(incidencias?.map(i => i.categoria_incidencia))]);
  
  const { data: puntos, error: err2 } = await supabase.from('puntos_interes').select('tipo_punto');
  console.log('Puntos_interes Types:', [...new Set(puntos?.map(p => p.tipo_punto))]);

  const { data: bandas, error: err3 } = await supabase.from('bandas_organizadas').select('id_banda, latitud, longitud');
  console.log('Bandas con lat/lng:', bandas?.filter(b => b.latitud != null));
  
  const { data: actores, error: err4 } = await supabase.from('personas_interes').select('id_persona_interes, latitud, longitud');
  console.log('Actores con lat/lng:', actores?.filter(a => a.latitud != null));
}

check();

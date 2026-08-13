import { supabase } from './src/lib/supabase.js';

async function testQueries() {
  console.log('Testing incidencias_cibernetica query...');
  const { data: ciber, error: errCiber } = await supabase
    .from('incidencias_cibernetica')
    .select('*, incidencias(*), cibernetica_autores(*)');
  
  if (errCiber) console.error('Ciber Error:', errCiber);
  else console.log(`Ciber Data: ${ciber?.length} rows. First row:`, JSON.stringify(ciber?.[0]).substring(0, 200));

  console.log('\nTesting incidencias_manifestaciones query...');
  const { data: mani, error: errMani } = await supabase
    .from('incidencias_manifestaciones')
    .select('*, incidencias(*)');
  
  if (errMani) console.error('Mani Error:', errMani);
  else console.log(`Mani Data: ${mani?.length} rows. First row:`, JSON.stringify(mani?.[0]).substring(0, 200));

  console.log('\nTesting incidencias excluidas...');
  const { data: incidencias, error: errInc } = await supabase.from('incidencias').select('id_incidencia, latitud, longitud, categoria_incidencia');
  if (errInc) console.error('Incidencias Error:', errInc);
  else console.log(`Incidencias Data: ${incidencias?.length} rows. First row:`, JSON.stringify(incidencias?.[0]).substring(0, 200));

  console.log('\nTesting puntos_interes query...');
  const { data: puntos, error: errPuntos } = await supabase.from('puntos_interes').select('id_punto, tipo_punto, latitud, longitud');
  if (errPuntos) console.error('Puntos Error:', errPuntos);
  else console.log(`Puntos Data: ${puntos?.length} rows. Types:`, [...new Set(puntos?.map(p => p.tipo_punto))]);
}

testQueries();

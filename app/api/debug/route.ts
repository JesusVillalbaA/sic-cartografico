import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  try {
    const { data: puntos, error: err1 } = await supabase.from('puntos_interes').select('*');
    const { data: personas, error: err2 } = await supabase.from('personas_interes').select('*');
    const { data: sustancias, error: err3 } = await supabase.from('reporte_sustancias').select('*');

    return NextResponse.json({
      puntos: {
        error: err1?.message || null,
        count: puntos?.length || 0,
        sample: puntos?.[0] || null,
        all: puntos || []
      },
      personas: {
        error: err2?.message || null,
        count: personas?.length || 0,
        sample: personas?.[0] || null,
        all: personas || []
      },
      sustancias: {
        error: err3?.message || null,
        count: sustancias?.length || 0,
        sample: sustancias?.[0] || null,
        all: sustancias || []
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}

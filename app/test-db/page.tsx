"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestDbPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: puntos, error: err1 } = await supabase.from('puntos_interes').select('*');
        const { data: personas, error: err2 } = await supabase.from('personas_interes').select('*');
        const { data: sustancias, error: err3 } = await supabase.from('reporte_sustancias').select('*');
        const { data: incidencias, error: err4 } = await supabase.from('incidencias').select('*');
        const { data: usuarios, error: err5 } = await supabase.from('usuarios_maestra').select('*');

        setData({
          puntos: { data: puntos, error: err1 },
          personas: { data: personas, error: err2 },
          sustancias: { data: sustancias, error: err3 },
          incidencias: { data: incidencias, error: err4 },
          usuarios: { data: usuarios, error: err5 }
        });
      } catch (err: any) {
        setData({ error: err.message });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white bg-slate-900 h-screen">Loading database test...</div>;

  return (
    <div className="p-8 text-slate-100 bg-slate-950 min-h-screen overflow-auto font-mono text-xs">
      <h1 className="text-xl font-bold mb-4 text-cyan-400">DATABASE DIAGNOSTIC PANEL</h1>
      
      <div className="space-y-6">
        {Object.entries(data || {}).map(([key, value]: any) => (
          <div key={key} className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <h2 className="text-lg font-bold capitalize text-amber-400 mb-2">{key}</h2>
            {value.error ? (
              <p className="text-red-400 font-bold">Error: {value.error.message || JSON.stringify(value.error)}</p>
            ) : (
              <div>
                <p className="text-emerald-400 mb-2">Count: {value.data?.length ?? 0}</p>
                <pre className="bg-slate-950 p-2 rounded max-h-48 overflow-y-auto text-[10px]">
                  {JSON.stringify(value.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

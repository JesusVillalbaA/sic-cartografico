export const EstacionServicioCard = ({ feature, onRemove }: any) => {
  const props = feature.properties || {};
  const name = props.NAME || props.name || props.nombre || "Estación sin nombre";
  const region = props.RegionName || props.region || "";
  const city = props.CityName || props.city || "";
  const direccion = props.StreetDesc || props.direccion || "";
  const phone = props.Phone || "";

  // Crear una descripción pequeña con la información disponible
  let descripcion = "";
  if (region && city) descripcion = `${region}, ${city}`;
  else if (region) descripcion = `Región: ${region}`;
  else if (city) descripcion = `Ciudad: ${city}`;
  else if (direccion) descripcion = direccion;
  else descripcion = "Estación de servicio en Nueva Esparta";

  // Si hay teléfono, lo añadimos como detalle extra
  const tieneTelefono = phone && phone.trim() !== "";

  return (
    <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 rounded-2xl border border-emerald-500/30 p-4 relative overflow-hidden backdrop-blur-sm">
      {/* Fondo decorativo sutil */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
      
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 z-10 text-white/40 hover:text-red-400 transition-colors duration-200"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        {/* Icono de la gasolinera con fondo blanco */}
        <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-white/30">
          <img
            src="/bombagasolina.png"
            alt="Gasolinera"
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Contenido textual */}
        <div className="flex-1">
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span>⛽</span> ESTACIÓN DE SERVICIO
          </p>
          <h4 className="text-lg font-bold text-white leading-tight mt-0.5">
            {name}
          </h4>

          {/* Descripción pequeña */}
          <p className="text-xs text-white/70 mt-1 italic">
            {descripcion}
          </p>

          {props.TIPO_SERVICIO && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                {props.TIPO_SERVICIO}
              </span>
            </div>
          )}

          {/* Detalle de teléfono si existe */}
          {tieneTelefono && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-white/50">
              <span>📞</span>
              <span>{phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
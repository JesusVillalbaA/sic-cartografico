import { GoogleMapsButton } from '../GoogleMapsButton';

export const IapolepneCard = ({ feature, onRemove }: any) => {
  const props = feature.properties || {};
  const name = props.NAME || props.name || "Comando policial";
  const area = props.ENCLOSED_A ? `Área: ${props.ENCLOSED_A}` : "";
  const perimetro = props.PERIMETER ? `Perímetro: ${props.PERIMETER}` : "";

  return (
    <div className="bg-blue-950/40 rounded-2xl border border-blue-500/20 p-4 relative">
      <button onClick={onRemove} className="absolute top-2 right-2 text-white/40 hover:text-red-400">✕</button>
      <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider">👮 IAPOLENE</p>
      <h4 className="text-lg font-bold text-white">{name}</h4>
      {area && <p className="text-xs text-white/60">{area}</p>}
      {perimetro && <p className="text-xs text-white/40">{perimetro}</p>}
      <p className="text-[10px] text-white/30 mt-2 mb-3">
        {feature.geometry?.type === "Polygon" ? "📍 Área de influencia" : "📍 Punto de control"}
      </p>

      <GoogleMapsButton feature={feature} className="w-full" />
    </div>
  );
};
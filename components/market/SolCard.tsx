import { Sol } from "@/interface/type";

interface SolCardProps {
  sol: Sol;
}

export function SolCard({ sol }: SolCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold text-lg text-gray-800">{sol.nom}</h4>
      <p className="text-sm text-gray-600 mt-1">{sol.description || 'Aucune description disponible'}</p>
      <div className="mt-2 pt-2 border-t space-y-1">
        <p className="text-sm text-gray-700">
          <span className="font-medium">pH:</span> {sol.ph.toFixed(1)}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Humidité:</span> {sol.humidite}%
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Salinité:</span> {sol.salinite}%
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Texture:</span> {sol.texture}
        </p>
        {sol.matiere_organique && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Matière organique:</span> {sol.matiere_organique}%
          </p>
        )}
        {sol.capacite_drainage && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Capacité de drainage:</span> {sol.capacite_drainage}
          </p>
        )}
      </div>
    </div>
  );
}

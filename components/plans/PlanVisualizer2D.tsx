
'use client'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'
import L from 'leaflet'
import type { Feature, GeoJsonProperties, Geometry, FeatureCollection } from 'geojson'
import { PlanProposal, Parcelle } from '@/interface/type'

export default function Plan2D({ plan }: { plan: PlanProposal }) {
  // Définir le type complet pour les features
  interface ParcelleFeature extends Feature<Geometry, GeoJsonProperties> {
    properties: {
      id_parcelle: string
      id_culture: number
      couleur: string
      pourcentage: number
    }
  }

  // Créer un FeatureCollection valide
  const geoJsonData: FeatureCollection<Geometry, GeoJsonProperties> = useMemo(() => ({
    type: 'FeatureCollection',
    features: plan.parcelles.map((parcelle: Parcelle) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: parcelle.geometrie.coordinates
      },
      properties: {
        id_parcelle: parcelle.id_parcelle,
        id_culture: parcelle.id_culture,
        couleur: parcelle.culture?.couleur || '#cccccc',
        pourcentage: parcelle.pourcentage
      }
    }))
  }), [plan.parcelles])

  const center: L.LatLngTuple = useMemo(() => [
    plan.dimensions.height / 2, 
    plan.dimensions.width / 2
  ], [plan.dimensions])

  const bounds: L.LatLngBoundsLiteral = useMemo(() => [
    [0, 0],
    [plan.dimensions.height, plan.dimensions.width]
  ], [plan.dimensions])

  const parcelleStyle = (feature?: ParcelleFeature) => ({
    fillColor: feature?.properties?.couleur || '#cccccc',
    fillOpacity: 0.7,
    color: '#000',
    weight: 1,
  })

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        crs={L.CRS.Simple}
        bounds={bounds}
      >
        <TileLayer
          url={plan.image_base || '/default-plan.png'}
          bounds={bounds}
          noWrap
        />
        
        <GeoJSON
          key={plan.id_plan}
          data={geoJsonData}
          style={parcelleStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindTooltip(
                `Parcelle: ${feature.properties.id_parcelle}<br>
                 Culture: ${feature.properties.id_culture}<br>
                 Couverture: ${feature.properties.pourcentage}%`,
                { permanent: false }
              )
            }
          }}
        />
      </MapContainer>
    </div>
  )
}
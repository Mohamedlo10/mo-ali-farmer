"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, Filter } from "lucide-react";
import { CultureCard } from "@/components/market/CultureCard";
import { LoadingSkeleton } from "@/components/market/LoadingSkeleton";
import { EmptyState } from "@/components/market/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCulturesWithCurrentPrice } from "../api/cultures/query";

export default function MarchePage() {
  const [cultures, setCultures] = useState<any[]>([]);
  const [filteredCultures, setFilteredCultures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getCulturesWithCurrentPrice().then(setCultures).finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    const filtered = cultures.filter((culture) =>
      culture.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCultures(filtered);
  }, [searchTerm, cultures]);

  const availableCultures = filteredCultures.filter(c => c.prix_actuel !== null);
  const unavailableCultures = filteredCultures.filter(c => c.prix_actuel === null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient background */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/10 rounded-full">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">Marché Agricole</h1>
            </div>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Découvrez les meilleurs produits agricoles locaux avec des prix en temps réel
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>{cultures.length} produits disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{availableCultures.length} avec prix</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <LoadingSkeleton />
          </div>
        ) : filteredCultures.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Cultures with prices */}
            {availableCultures.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-primary rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Produits disponibles
                  </h2>
                  <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                    {availableCultures.length} produit{availableCultures.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {availableCultures.map((culture, index) => (
                    <div
                      key={culture.id_culture}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="animate-scale-in"
                    >
                      <CultureCard culture={culture} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cultures without prices */}
            {unavailableCultures.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-muted rounded-full"></div>
                  <h2 className="text-xl font-semibold text-muted-foreground">
                    Prochainement disponibles
                  </h2>
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                    {unavailableCultures.length} produit{unavailableCultures.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {unavailableCultures.map((culture, index) => (
                    <div
                      key={culture.id_culture}
                      style={{ animationDelay: `${(availableCultures.length + index) * 100}ms` }}
                      className="animate-scale-in opacity-75"
                    >
                      <CultureCard culture={culture} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
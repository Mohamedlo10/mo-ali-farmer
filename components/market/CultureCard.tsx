import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import PriceChart from "@/components/PriceChart";
import { SolCard } from "@/components/market/SolCard";
import { getStatsCultureById } from "@/app/api/cultures/query";
import { getSolsByCultureId } from "@/app/api/sols/query";
import { Sol } from "@/interface/type";
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton" // Assurez-vous que ce fichier existe
interface CultureCardProps {
  culture: {
    id_culture: number;
    nom: string;
    img_url: string | null;
    prix_actuel: number | null;
    description?: string;
  };
}

const CultureCard = ({ culture }: CultureCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<{ date: string; price: number }[]>([]);
  const [sols, setSols] = useState<Sol[]>([]);

  const loadData = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      // Charger les données des prix
      const { chartData } = await getStatsCultureById(culture.id_culture);
      setPriceData(chartData);
      
      // Charger les sols associés
      const solsData = await getSolsByCultureId(culture.id_culture);
      setSols(solsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les données quand le drawer s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-medium animate-fade-in">
      <Drawer open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          loadData();
        }
      }}>
        <DrawerTrigger asChild>
          <div className="cursor-pointer p-6 text-center space-y-4 h-full">
            {/* Image container with gradient overlay */}
            <div className="relative mx-auto w-32 h-32 mb-4 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              <img
                src={imageError ? '/default-culture.png' : culture.img_url || '/default-culture.png'}
                alt={culture.nom}
                className="w-full h-full object-cover rounded-full border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105 aspect-square"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/5 to-transparent"></div>
            </div>

            {/* Culture name */}
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {culture.nom}
            </h3>

            {/* Price */}
            <div className="space-y-1">
              {culture.prix_actuel !== null ? (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Prix actuel</div>
                  <div className="text-xl font-bold text-success">
                    {culture.prix_actuel} F/kg
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Prix non disponible
                </div>
              )}
            </div>

            {/* Hover effect indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </DrawerTrigger>
        
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl p-6">
              <DrawerHeader className="px-0 pt-0">
                <DrawerTitle className="text-2xl">{culture.nom}</DrawerTitle>
                <DrawerDescription>
                  Détails du produit
                </DrawerDescription>
              </DrawerHeader>
            
              <div className="grid gap-4 py-4">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <img
                      src={imageError ? '/default-culture.png' : culture.img_url || '/default-culture.png'}
                      alt={culture.nom}
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setImageError(true)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Prix actuel</h4>
                  <p className="text-2xl font-bold text-primary">
                    {culture.prix_actuel ? `${culture.prix_actuel.toFixed(2)} €` : 'Prix non disponible'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-muted-foreground mb-4">
                    {culture.description || 'Aucune description disponible pour le moment.'}
                  </p>
                </div>

                {/* Graphique des prix */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Évolution des prix</h4>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full rounded-md" />
                  ) : priceData.length > 0 ? (
                    <PriceChart 
                      data={priceData} 
                      title={`Prix de ${culture.nom} sur le marché`} 
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Aucune donnée de prix disponible pour le moment.
                    </p>
                  )}
                </div>

                {/* Sols associés */}
                <div className="mt-8">
                  <h4 className="font-medium mb-3">Sols adaptés</h4>
                  {isLoading ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : sols.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      {sols.map((sol) => (
                        <SolCard key={sol.id_sol} sol={sol} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Aucun sol associé n'a été trouvé pour cette culture.
                    </p>
                  )}
                </div>
              </div>
          </div>
          
          </div>
          
          <DrawerFooter className="border-t pt-4">
            <Button 
              className='cursor-pointer hover:bg-primary/10 hover:text-primary' 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Card>
  );
};

export { CultureCard };
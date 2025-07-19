import { Sprout, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <Card className="p-8 text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-10"></div>
            <div className="relative w-full h-full rounded-full bg-muted flex items-center justify-center">
              <Sprout className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Aucune culture disponible
        </h3>
        <p className="text-muted-foreground mb-4">
          Il n'y a pas de produits agricoles à afficher pour le moment.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Search className="w-4 h-4" />
          <span>Revenez plus tard pour voir les nouveaux produits</span>
        </div>
      </Card>
    </div>
  );
}
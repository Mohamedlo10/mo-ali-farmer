"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { Culture, PlanProposal } from "@/interface/type";
import PlanVisualizer2D from "@/components/plans/PlanVisualizer2D";
import PlanVisualizer3D from "@/components/plans/PlanVisualizer3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, BarChart3, MapPin, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getPlanWithParcelles } from "@/app/api/plans/query";

// Composant enfant qui utilise useSearchParams
const PlanProfileContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [plan, setPlan] = useState<PlanProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const idPlan = searchParams.get("id");

  useEffect(() => {
    async function fetchPlan() {
      if (!idPlan) return;
      setLoading(true);
      setError(null);
      try {
        const planData = await getPlanWithParcelles(Number(idPlan));
        console.log(planData);
        setPlan(planData);
      } catch (err: any) {
        setError("Erreur lors du chargement du plan : " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return "plan-success";
    if (risk <= 6) return "plan-warning";
    return "destructive";
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return "Faible";
    if (risk <= 6) return "Modéré";
    return "Élevé";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-plan-success bg-clip-text text-transparent">
            Plan Agricole Optimisé
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualisation détaillée et analyse de votre plan d'optimisation agricole
          </p>
        </div>

        {/* Plan Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Superficie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{plan?.superficie?.toLocaleString()} m²</div>
              <p className="text-xs text-muted-foreground">
                {plan?.dimensions?.width}m × {plan?.dimensions?.height}m
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-plan-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Profit Estimé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-plan-success">
                {formatCurrency(plan?.profit_estime || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Revenus annuels prévus</p>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--${getRiskColor(plan?.niveau_risque || 0)}))` }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Niveau de Risque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold" style={{ color: `hsl(var(--${getRiskColor(plan?.niveau_risque || 0)}))` }}>
                  {plan?.niveau_risque}/10
                </div>
                <Badge variant="outline" style={{ 
                  borderColor: `hsl(var(--${getRiskColor(plan?.niveau_risque || 0)}))`,
                  color: `hsl(var(--${getRiskColor(plan?.niveau_risque || 0)}))`
                }}>
                  {getRiskLabel(plan?.niveau_risque || 0)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Évaluation des risques</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-plan-info">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Cultures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-plan-info">{plan?.parcelles?.length}</div>
              <p className="text-xs text-muted-foreground">Types de cultures planifiées</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{plan?.nom}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{plan?.description}</p>
          </CardContent>
        </Card>

        {/* Visualization Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visualisation du Plan
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  className={viewMode === "2d" ? "hover:bg-primary cursor-pointer text-white" : ""}
                  variant={viewMode === "2d" ? "default" : "outline"}
                  onClick={() => setViewMode("2d")}
                  size="sm"
                >
                  Vue 2D
                </Button>
                <Button
                  className={viewMode === "3d" ? "hover:bg-primary cursor-pointer text-white" : ""}
                  variant={viewMode === "3d" ? "default" : "outline"}
                  onClick={() => setViewMode("3d")}
                  size="sm"
                >
                  Vue 3D
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] rounded-lg overflow-hidden border border-border">
              {viewMode === "2d" ? (
                <PlanVisualizer2D plan={plan || null} />
              ) : (
                <PlanVisualizer3D plan={plan || null} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parcelles Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Détail des Parcelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan?.parcelles?.map((parcelle, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-border bg-card/50 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: parcelle.culture?.couleur || "#10B981" }}
                      />
                      <div>
                        <h4 className="font-semibold text-card-foreground">
                          {parcelle.culture?.nom || `Culture ${index + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {parcelle.proprietes?.forme && `Forme: ${parcelle.proprietes?.forme}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      {parcelle.pourcentage}%
                    </Badge>
                  </div>
                  
                  {(parcelle.proprietes?.grid_x !== undefined && parcelle.proprietes?.grid_y !== undefined) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Position: ({parcelle.proprietes?.grid_x}, {parcelle.proprietes?.grid_y})</span>
                      <span>•</span>
                      <span>Surface: {Math.round(plan.superficie * parcelle.pourcentage / 100)} m²</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Chargement du plan...</span>
  </div>
);

// Composant parent qui gère le Suspense
const PlanProfile = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlanProfileContent />
    </Suspense>
  );
};

export default PlanProfile;
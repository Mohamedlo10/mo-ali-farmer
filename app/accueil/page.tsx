"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlans } from "@/app/api/plans/query";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanProposal } from "@/interface/type";
import { PlusIcon, LayoutIcon, TrendingUpIcon, ShieldIcon, CalendarIcon } from "lucide-react";
export default function PlansPage() {
  const [plans, setPlans] = useState<PlanProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error("Erreur lors du chargement des plans:", err);
        setError("Impossible de charger les plans");
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

    const getStatusBadge = (statut: number ) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (statut) {
      case 5:
        return `${baseClass} bg-emerald-100 text-emerald-800 border border-emerald-200`;
      case 6:
        return `${baseClass} bg-amber-100 text-amber-800 border border-amber-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };


    const getRiskColor = (risk: number) => {
    if (risk <= 3) return "bg-emerald-500";
    if (risk <= 5) return "bg-amber-500"; 
    return "bg-red-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return "Faible";
    if (risk <= 5) return "Modéré";
    return "Élevé";
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header avec glassmorphism */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5"></div>
        <div className="relative container mx-auto py-8 px-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Mes Plans Optimisés
              </h1>
              <p className="text-slate-600 text-lg">
                Gérez et optimisez vos stratégies agricoles
              </p>
            </div>
            <Link href="/accueil/nouveau">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 border-0 px-6 py-3">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <PlusIcon size={18} className="transition-transform group-hover:rotate-90 duration-300" />
                  Nouveau Plan
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium">Chargement de vos plans...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldIcon className="h-5 w-5 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-12 max-w-2xl mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                <LayoutIcon className="relative mx-auto h-20 w-20 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Aucun plan disponible
              </h3>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                Commencez par créer votre premier plan d'optimisation pour maximiser vos rendements agricoles
              </p>
              <Link href="/accueil/nouveau">
                <Button className="group bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 border-0 px-8 py-4 text-lg">
                  <div className="flex items-center gap-3">
                    <PlusIcon size={20} className="transition-transform group-hover:rotate-90 duration-300" />
                    Créer mon premier plan
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={plan.id_plan}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards"
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative bg-gradient-to-r from-emerald-50/50 to-blue-50/30 border-b border-emerald-100/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className={getStatusBadge(plan.niveau_risque )}>
                      {plan.niveau_risque <= 3  ? "Risque faible" :plan.niveau_risque <= 5 ? "Risque modéré" :plan.niveau_risque <= 6 ? "Risque élevé" : "Risque très élevé"}
                    </span>
                    <div className="flex items-center text-slate-500 text-sm">
                      <CalendarIcon size={14} className="mr-1" />
                      {new Date(plan.date_creation || "").toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-slate-800 text-xl font-bold group-hover:text-emerald-700 transition-colors duration-300">
                    {plan.nom}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base leading-relaxed">
                    {truncateDescription(plan.description || '')}
                    {plan.description && plan.description.length > 100 && (
                      <span className="text-emerald-600 text-sm font-medium ml-1">(suite...)</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-6 space-y-6">
                  {/* Profit estimé */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <TrendingUpIcon size={18} className="text-white" />
                      </div>
                      <span className="font-medium text-slate-700">Profit estimé</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-700">
                      {plan.profit_estime?.toLocaleString()} F
                    </span>
                  </div>

                  {/* Niveau de risque */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-500 rounded-lg">
                          <ShieldIcon size={18} className="text-white" />
                        </div>
                        <span className="font-medium text-slate-700">Niveau de risque</span>
                      </div>
                      <span className="font-semibold text-slate-600">
                        {getRiskLabel(plan.niveau_risque || 0)}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getRiskColor(plan.niveau_risque || 0)} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${((plan.niveau_risque || 0) / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="absolute right-0 top-4 text-sm font-medium text-slate-600">
                        {plan.niveau_risque || 0}/10
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="relative bg-slate-50/50 border-t border-slate-100">
                  <Link href={`/accueil/profile?id=${plan.id_plan}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-800 font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                    >
                      Voir les détails
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

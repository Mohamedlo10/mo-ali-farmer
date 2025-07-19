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
import { PlusIcon, LayoutIcon } from "lucide-react";
import { PlanProposal } from "@/interface/type";

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

  return (
    <div className="container text-black mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="md:text-3xl text-xl font-bold">Mes plans optimisés</h1>
        <Link href="/accueil/nouveau">
          <Button className="flex items-center bg-green-800 hover:bg-green-600 text-white font-bold cursor-pointer gap-2">
            <PlusIcon size={16} />
            Nouveau plan
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <LayoutIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">
            Aucun plan disponible
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Commencez par créer un nouveau plan d'optimisation pour votre
            terrain
          </p>
          <div className="w-full flex justify-center items-center text-white mt-6">
            <Link href="/accueil/nouveau">
              <Button className="flex items-center gap-2 text-white">
                <PlusIcon size={16} />
                Créer mon premier plan
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.nom}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-green-50/5">
                <CardTitle className="text-green-800 text-base">
                  {plan.nom}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Profit estimé:</span>
                    <span className="text-green-600 font-bold">
                      {plan.profit_estime?.toLocaleString()} F CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Niveau de risque:
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-red-500"
                          style={{
                            width: `${((plan.niveau_risque || 0) / 10) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">
                        {(plan.niveau_risque || 0) * 10}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Link
                  href={`/accueil/profile?id=${plan.id_plan}`}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full bg-black hover:bg-black/80 text-white font-bold cursor-pointer"
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
  );
}

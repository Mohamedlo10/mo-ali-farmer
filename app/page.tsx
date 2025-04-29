'use client'
import { useState } from "react";
import Image from "next/image";
import { userConnection, userSignUp } from "@/app/api/auth/query";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await userConnection(telephone, password);
        if (error) {
          setError(error.message || "Erreur lors de la connexion");
        } else if (data.session) {
          localStorage.setItem('user_session', JSON.stringify(data.session));
          router.push("/accueil");
        } else {
          setError("Aucune session utilisateur trouvée");
        }
      } else {
        const { data, error } = await userSignUp(telephone, password, fullName);
        if (error) {
          setError(error.message || "Erreur lors de l'inscription");
        } else if (data.session) {
          localStorage.setItem('user_session', JSON.stringify(data.session));
          router.push("/accueil");
        } else {
          setError("Inscription réussie, veuillez vérifier votre email ou vous connecter.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <Image
        src="/moali.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="max-w-md w-full space-y-8 p-8 bg-white/94 backdrop-blur-sm rounded-xl shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? "Connexion" : "Inscription"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              required
              pattern="[0-9]{8,15}"
              className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
              placeholder="770000000"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors duration-200"
          >
            {isLogin
              ? "Pas encore de compte ? Inscrivez-vous"
              : "Déjà un compte ? Connectez-vous"}
          </button>
        </div>
      </div>
    </div>
  );
}

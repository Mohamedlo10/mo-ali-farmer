import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white  to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className=" w-full  relative flex min-h-screen flex-col items-center justify-center md:grid bg-emerald-700 md:max-w-none md:grid-cols-2 md:px-0">
        {/* Left side with illustration and branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r md:flex">
          <div className="absolute inset-0 bg-zinc-900">
            <Image
              src="/moali.png"
              alt="Background"
              fill
              className="object-cover w-full h-full opacity-20 dark:opacity-30"
            />
          </div>
          <div className="relative z-20 flex items-center text-lg font-medium text-white">
            <Image
              src="/next.svg"
              alt="Logo"
              width={32}
              height={32}
              className="mr-2 dark:invert"
            />
            Mo Ali Farmer
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-white">
                "Cette plateforme va revolutionner la vie des agriculteurs dans
                la repartition intelligentes des parcelles."
              </p>
              <footer className="text-sm text-gray-300">
                avec une etude des sols et du marches.
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Right side with login form */}
        <div className="flex w-full text-white items-center justify-center md:p-8">
          <div className="mx-auto w-full md:max-w-[450px] max-w-[350px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">
                Bienvenue sur
              </h3>
              <h1 className="text-4xl font-bold tracking-tight">EliteBudget</h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour accéder à votre espace
              </p>
            </div>
            <LoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              En vous connectant, vous acceptez nos{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

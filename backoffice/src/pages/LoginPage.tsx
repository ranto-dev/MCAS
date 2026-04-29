import { useState } from "react";

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = onLogin(username.trim(), password);
    if (!success) {
      setError("Identifiants invalides. Utilisez admin / admin123.");
      return;
    }
    setError("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50/40 p-4">
      <section className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-black">Connexion administrateur</h1>
        <p className="mt-1 text-sm text-black/70">Entrez votre nom d'utilisateur et votre mot de passe.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-black" htmlFor="username">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-black" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}

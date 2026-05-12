import { AlertTriangle } from 'lucide-react';

export function SetupBanner() {
  return (
    <div className="px-4 py-2 text-xs sm:text-sm border-b border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200 flex items-start gap-2">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <div>
        <strong>Modo offline:</strong> a API do Neon ainda não está configurada (ou está fora). Defina{' '}
        <code className="px-1 rounded bg-amber-500/20">VITE_API_URL</code> em{' '}
        <code>.env.local</code> apontando para a URL das funções serverless
        (ex.: <code>https://seu-app.vercel.app/api</code>) e rode <code>npm run dev</code> novamente.
        Por enquanto as tarefas ficam só no seu navegador (cache local) e são sincronizadas assim que a API voltar.
      </div>
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';

export function SetupBanner() {
  return (
    <div className="px-4 py-2 text-xs sm:text-sm border-b border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200 flex items-start gap-2">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <div>
        <strong>Modo offline:</strong> o Supabase ainda não está configurado. Defina{' '}
        <code className="px-1 rounded bg-amber-500/20">VITE_SUPABASE_URL</code> e{' '}
        <code className="px-1 rounded bg-amber-500/20">VITE_SUPABASE_ANON_KEY</code> em{' '}
        <code>.env.local</code> e rode <code>npm run dev</code> novamente para ativar a colaboração em tempo real.
        As tarefas criadas agora ficam apenas no seu navegador.
      </div>
    </div>
  );
}

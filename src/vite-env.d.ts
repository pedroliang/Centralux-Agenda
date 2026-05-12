/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base das funções serverless que falam com o Neon.
   * Em dev com `vercel dev` ou hospedando tudo no Vercel: deixe vazio (será usado "/api").
   * No GitHub Pages aponte para o domínio do seu deploy Vercel:
   *   VITE_API_URL=https://centralux-agenda.vercel.app/api
   */
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

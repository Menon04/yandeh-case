/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SUPPLIER_ID: string
  readonly VITE_BUYER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

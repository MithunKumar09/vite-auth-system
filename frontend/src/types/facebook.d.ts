// src/types/facebook.d.ts
export {};

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any; // You can refine this with Facebook SDK types if needed
  }
}

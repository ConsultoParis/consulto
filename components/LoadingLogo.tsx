import LogoAnimated from "@/components/LogoAnimated";

export default function LoadingLogo() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24">
      <LogoAnimated size="md" />
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-mutedmore">Chargement...</p>
    </div>
  );
}

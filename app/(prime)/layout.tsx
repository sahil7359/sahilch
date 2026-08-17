import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/Footer';
import { LenisProvider } from '@/components/LenisProvider';

export default function PrimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LenisProvider />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      {/* ChatLauncher mounts here in Phase 7, gated by NEXT_PUBLIC_FEATURE_CHAT. */}
    </>
  );
}

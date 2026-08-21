import { Nav } from '@/components/nav/Nav';
import { Footer } from '@/components/Footer';
import { LenisProvider } from '@/components/LenisProvider';
import { ChatLauncher } from '@/components/chat/ChatLauncher';
import { ResumeGate } from '@/components/resume/ResumeGate';

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
      <ChatLauncher />
      <ResumeGate />
    </>
  );
}

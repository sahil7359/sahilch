import { Hero } from '@/components/hero/Hero';
import { Goals } from '@/components/sections/Goals';
import { Work } from '@/components/sections/Work';
import { Stack } from '@/components/sections/Stack';
import { Experience } from '@/components/sections/Experience';
import { Certifications } from '@/components/sections/Certifications';
import { Hobbies } from '@/components/sections/Hobbies';
import { Contact } from '@/components/sections/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <Goals />
      <Work />
      <Stack />
      <Experience />
      <Certifications />
      <Hobbies />
      <Contact />
    </>
  );
}

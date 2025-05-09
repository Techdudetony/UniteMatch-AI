import './globals.css';
import { League_Spartan } from 'next/font/google';
import StickyNav from '../../components/StickyNav'; // adjust path if needed

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-league-spartan',
});

export const metadata = {
  title: 'UniteMatch AI',
  description: 'Optimize Pokémon Unite teams with data & ML',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={leagueSpartan.variable}>
      <body className="bg-[var(--color-purple)] text-white font-sans">
        <StickyNav />
        {children}
      </body>
    </html>
  );
}

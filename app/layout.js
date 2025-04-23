import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GreenStake',
  description: 'Decentralized Green Energy Funding Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-100">
            <Navigation />
            <main className="w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </Providers>        
      </body>
    </html>
  );
}

import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'SupplyHub',
  description: 'Order ingredients for restaurant outlets',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

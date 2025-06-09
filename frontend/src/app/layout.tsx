'use client';
import "./globals.css";
import { Inter } from "next/font/google";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="mytheme">
      <body className={`${inter.variable} antialiased`}>
        <Provider store={store}>
          <ToastContainer position="top-right" autoClose={5000} />
          {children}
        </Provider>
      </body>
    </html>
  );
}

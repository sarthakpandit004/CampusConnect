import { SessionProvider } from "next-auth/react";

import "./globals.css";
import AuthProvider from "@/component/AuthProvide";

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
/* eslint-disable prettier/prettier */
// src/express-session.d.ts

declare module 'express-session' {
  interface SessionData {
    user: string; // Change the type to match your user data
    // You can include other session properties as needed
  }
}

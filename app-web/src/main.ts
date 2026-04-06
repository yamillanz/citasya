import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Suppress Supabase NavigatorLockAcquireTimeoutError and AuthApiError logs
const originalError = console.error;
console.error = function (message?: any, ...optionalParams: any[]) {
  const fullMessage = [message, ...optionalParams].map(p => 
    typeof p === 'string' ? p : (p && p.toString ? p.toString() : JSON.stringify(p))
  ).join(' ');
  
  if (
    fullMessage.includes('NavigatorLockAcquireTimeoutError') ||
    fullMessage.includes('AuthApiError: Invalid Refresh Token') ||
    fullMessage.includes('lock:sb-')  // More general pattern for Supabase lock errors
  ) {
    return;
  }
  originalError.apply(console, [message, ...optionalParams]);
};

// Also suppress unhandled promise rejections from Supabase
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason && typeof reason === 'object' && reason.message) {
    if (
      reason.message.includes('NavigatorLockAcquireTimeoutError') ||
      reason.message.includes('AuthApiError: Invalid Refresh Token')
    ) {
      event.preventDefault();
      return;
    }
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

import { trigger, transition, style, animate, keyframes } from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const stepComplete = trigger('stepComplete', [
  transition('void => *', [
    style({ transform: 'scale(0)' }),
    animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
      style({ transform: 'scale(1)' }))
  ])
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('0.3s ease-in', style({ opacity: 1 }))
  ])
]);

export const shakeError = trigger('shakeError', [
  transition('* => *', [
    animate('0.5s', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.1 }),
      style({ transform: 'translateX(10px)', offset: 0.2 }),
      style({ transform: 'translateX(-10px)', offset: 0.3 }),
      style({ transform: 'translateX(10px)', offset: 0.4 }),
      style({ transform: 'translateX(0)', offset: 0.5 })
    ]))
  ])
]);
import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, map, switchMap, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { supabase } from '../supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = supabase;
  
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return this.getUserData(data.user.id);
  }
  
  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
    return this.getUserData(data.user!.id);
  }
  
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
  
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) return null;
    return this.getUserData(data.user.id);
  }
  
  private async getUserData(userId: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  getUserRole(): Observable<UserRole | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map(response => response.data.user),
      switchMap(user => {
        if (!user) return of(null);
        return from(
          this.supabase.from('users').select('role, company_id').eq('id', user.id).single()
        ).pipe(
          map(response => response.data?.role || null)
        );
      })
    );
  }
  
  onAuthStateChange(): Observable<any> {
    return new Observable(observer => {
      this.supabase.auth.onAuthStateChange((event, session) => {
        observer.next({ event, session });
      });
    });
  }
}

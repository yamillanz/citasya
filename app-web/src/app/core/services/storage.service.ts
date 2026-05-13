import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase: SupabaseClient = supabase;

  async uploadReceipt(
    file: File,
    companyId: string,
    appointmentId: string,
    type: 'completion' | 'payment'
  ): Promise<string> {
    this.validateFile(file);

    const ext = this.getFileExtension(file);
    const path = `receipts/${companyId}/${appointmentId}_${type}.${ext}`;

    const { error } = await this.supabase
      .storage
      .from('receipts')
      .upload(path, file, { upsert: true });

    if (error) throw new Error('Error al subir el comprobante. Intente de nuevo.');

    const { data } = this.supabase
      .storage
      .from('receipts')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteReceipt(path: string): Promise<void> {
    const { error } = await this.supabase
      .storage
      .from('receipts')
      .remove([path]);

    if (error) throw error;
  }

  getReceiptUrl(companyId: string, appointmentId: string, type: 'completion' | 'payment'): string {
    const ext = 'jpg';
    const path = `receipts/${companyId}/${appointmentId}_${type}.${ext}`;
    const { data } = this.supabase
      .storage
      .from('receipts')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  private validateFile(file: File): void {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Solo se permiten imágenes PNG o JPG');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('La imagen no debe superar 2MB');
    }
  }

  private getFileExtension(file: File): string {
    const typeToExt: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg'
    };
    return typeToExt[file.type] || 'jpg';
  }
}

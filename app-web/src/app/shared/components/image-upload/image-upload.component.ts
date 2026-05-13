import {
  Component,
  signal,
  input,
  output,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, ProgressBarModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageUploadComponent {
  currentImageUrl = input<string | null>(null);
  uploading = input(false);
  error = input<string | null>(null);

  imageSelected = output<File>();
  imageRemoved = output<void>();

  previewUrl = signal<string | null>(null);
  fileName = signal<string>('');
  fileSize = signal<string>('');
  selectedFile = signal<File | null>(null);
  showPasteFeedback = signal(false);
  validationError = signal<string | null>(null);

  private previewBlobUrl: string | null = null;

  ngOnDestroy(): void {
    if (this.previewBlobUrl) {
      URL.revokeObjectURL(this.previewBlobUrl);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (this.uploading()) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          this.processFile(file, 'Imagen pegada');
        }
        return;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file, file.name);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.uploading()) return;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.processFile(file, file.name);
    }
  }

  removeImage(): void {
    if (this.previewBlobUrl) {
      URL.revokeObjectURL(this.previewBlobUrl);
      this.previewBlobUrl = null;
    }
    this.previewUrl.set(null);
    this.fileName.set('');
    this.fileSize.set('');
    this.selectedFile.set(null);
    this.validationError.set(null);
    this.imageRemoved.emit();
  }

  private processFile(file: File, name: string): void {
    this.validationError.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.validationError.set('Solo se permiten imágenes PNG o JPG');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.validationError.set('La imagen no debe superar 2MB');
      return;
    }

    if (this.previewBlobUrl) {
      URL.revokeObjectURL(this.previewBlobUrl);
    }

    const url = URL.createObjectURL(file);
    this.previewBlobUrl = url;
    this.previewUrl.set(url);
    this.fileName.set(name);
    this.fileSize.set(this.formatFileSize(file.size));
    this.selectedFile.set(file);
    this.imageSelected.emit(file);

    this.showPasteFeedback.set(true);
    setTimeout(() => this.showPasteFeedback.set(false), 1000);
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

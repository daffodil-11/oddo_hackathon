import JSZip from 'jszip';
import { BACKEND_FILES } from '../data/backendFiles';

export async function downloadBackendZip(): Promise<void> {
  const zip = new JSZip();

  // Add all backend files into the ZIP
  BACKEND_FILES.forEach(file => {
    zip.file(file.path, file.content);
  });

  // Create empty uploads directory placeholder
  zip.folder('uploads')?.file('.gitkeep', '');

  // Generate the zip archive as a blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dayflow-hrms-backend.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

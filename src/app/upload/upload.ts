import { Component, OnInit } from '@angular/core';
import { DriveService } from '../drive.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.html',
  styleUrls: ['./upload.css'],
  imports: [CommonModule]
})
export class UploadComponent implements OnInit {
  
  uploadProgressText = '';
  isUploading = false;

  constructor(public driveService: DriveService) {}

  ngOnInit() {
    this.driveService.initTokenClient();
    this.generateRosePetals();
  }

  onLogin() {
    this.driveService.requestToken();
  }

  // Generowanie dynamicznych płatków róż w tle strony
  generateRosePetals() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const petalCount = 20;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.classList.add('petal');
      
      const size = Math.random() * 10 + 8;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.left = `${Math.random() * 100}vw`;
      
      const delay = Math.random() * 8;
      petal.style.animationDelay = `${delay}s, ${delay}s`;
      
      const duration = Math.random() * 5 + 6;
      petal.style.animationDuration = `${duration}s, ${Math.random() * 3 + 3}s`;

      container.appendChild(petal);
    }
  }

  // Obsługa masowego wgrywania zdjęć z limitem współbieżności do 3 plików
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const fileArray = Array.from(input.files);
    const totalFiles = fileArray.length;
    
    this.isUploading = true;
    let completedCount = 0;
    
    const CONCURRENCY_LIMIT = 3; 
    const runningPool: Promise<void>[] = [];

    this.uploadProgressText = `Rozpoczynam wysyłanie ${totalFiles} zdjęć...`;

    for (const file of fileArray) {
      const uploadTask = this.driveService.uploadFile(file)
        .then(() => {
          completedCount++;
          this.uploadProgressText = `Wysłano ${completedCount} z ${totalFiles} zdjęć...`;
        })
        .catch((err) => {
          console.error(`Pominięto plik ${file.name} z powodu błędu.`, err);
        })
        .finally(() => {
          runningPool.splice(runningPool.indexOf(uploadTask), 1);
        });

      runningPool.push(uploadTask);

      if (runningPool.length >= CONCURRENCY_LIMIT) {
        await Promise.race(runningPool);
      }
    }

    await Promise.all(runningPool);

    this.isUploading = false;
    this.uploadProgressText = '';
    alert(`Sukces! Wszystkie zdjęcia (${totalFiles}) zostały zapisane w naszej ślubnej galerii Google Drive. Dziękujemy!`);
    input.value = ''; 
  }
}
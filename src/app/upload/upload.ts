import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DriveService } from '../drive.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.html',
  styleUrls: ['./upload.css'],
  imports: [CommonModule]
})
export class UploadComponent implements OnInit, OnDestroy {
  countdownText = '';
  private countdownInterval?: number;
  private petalInterval?: number;
  private confettiTimeout?: number;
  
  private readonly targetDate = new Date('2026-08-22T15:00:00');

  uploadProgressText = '';
  isUploading = false;
  showBlessing = false;
  private blessingTimeout?: number;
  showConfetti = false;
  isEnvelopeOpened = false;
  isEnvelopeOpening = false;

  constructor(public driveService: DriveService, public cdr: ChangeDetectorRef) {}

  toggleBlessing() {
    // reset any existing timer so clicking again restarts the display duration
    if (this.blessingTimeout) {
      window.clearTimeout(this.blessingTimeout);
      this.blessingTimeout = undefined;
    }

    this.showBlessing = true;
    this.cdr.detectChanges();

    this.blessingTimeout = window.setTimeout(() => {
      this.showBlessing = false;
      this.blessingTimeout = undefined;
      this.cdr.detectChanges();
    }, 5000);
  }

  ngOnInit() {
    this.driveService.initTokenClient();
    this.startCountdown();
    this.startPetals();
    // normal initialization
  }

  openEnvelope(): void {
    if (this.isEnvelopeOpening || this.isEnvelopeOpened) {
      return;
    }

    this.isEnvelopeOpening = true;
    this.cdr.detectChanges();

    window.setTimeout(() => {
      this.isEnvelopeOpened = true;
    }, 700);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      window.clearInterval(this.countdownInterval);
    }
    if (this.petalInterval) {
      window.clearInterval(this.petalInterval);
    }
    if (this.confettiTimeout) {
      window.clearTimeout(this.confettiTimeout);
    }
    // cleanup done
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.countdownInterval = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const now = new Date();
    const diff = this.targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      this.countdownText = 'Już trwa! 🎉';
      if (this.countdownInterval) {
        window.clearInterval(this.countdownInterval);
        this.countdownInterval = undefined;
      }
    } else {
      const seconds = Math.floor(diff / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      this.countdownText = `${days}d ${this.pad(hours)}g ${this.pad(minutes)}m ${this.pad(secs)}s`;
    }

    this.cdr.detectChanges();
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private startPetals(): void {
    this.petalInterval = window.setInterval(() => {
      this.createPetal();
    }, 700);
  }

  private createPetal(): void {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const petal = document.createElement('span');
    petal.className = 'petal';

    const size = 14 + Math.random() * 18;
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 6;
    const delay = Math.random() * 1.5;
    const rotation = Math.random() * 360;

    petal.style.left = `${left}%`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.6}px`;
    petal.style.opacity = `${0.55 + Math.random() * 0.35}`;
    petal.style.transform = `rotate(${rotation}deg)`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    const textureOpacity = 0.05 + Math.random() * 0.12;
    const textureSpacing = 3 + Math.random() * 2;
    const baseColor = Math.random() > 0.5
      ? 'rgba(255, 250, 245, 0.98), rgba(241, 233, 228, 0.9)'
      : 'rgba(255, 248, 242, 0.96), rgba(232, 214, 205, 0.86)';
    const hasVeins = Math.random() > 0.55;
    const veinOpacity = 0.08 + Math.random() * 0.1;

    const veinLayer = hasVeins
      ? `, linear-gradient(160deg, rgba(255,255,255,0) 0%, rgba(248, 236, 227, ${veinOpacity}) 28%, rgba(255, 255, 255, 0.06) 31%, rgba(236, 218, 206, ${veinOpacity * 0.8}) 35%, rgba(255,255,255,0) 100%)`
      : '';

    const veinGradient = hasVeins
      ? `, radial-gradient(circle at 50% 10%, rgba(255,255,255, 0.14), rgba(255,255,255, 0) 24%)`
      : '';

    petal.style.backgroundImage = `radial-gradient(circle at 30% 30%, ${baseColor}), repeating-linear-gradient(135deg, rgba(255,255,255, ${textureOpacity}) 0, rgba(255,255,255, 0) 1px, rgba(255,255,255, 0) ${textureSpacing}px)${veinLayer}${veinGradient}`;
    petal.style.backgroundBlendMode = 'overlay';
    petal.style.backgroundSize = `${size}px ${size}px, ${textureSpacing * 2}px ${textureSpacing * 2}px${hasVeins ? `, ${size * 2.2}px ${size * 2.2}px` : ''}`;

    const shadowChance = Math.random() > 0.65;
    if (shadowChance) {
      const shadowOffsetX = (Math.random() - 0.5) * 4;
      const shadowOffsetY = 2 + Math.random() * 3;
      const shadowBlur = 4 + Math.random() * 6;
      petal.style.boxShadow = `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px rgba(30, 20, 15, 0.18)`;
    }

    container.appendChild(petal);

    window.setTimeout(() => {
      petal.remove();
    }, (duration + delay) * 1000 + 500);
  }

  onLogin() {
    this.driveService.requestToken();
  }

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
          this.cdr.detectChanges();
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
    input.value = '';

    this.cdr.detectChanges();

    this.triggerConfetti(() => {
      alert(`Sukces! Wszystkie zdjęcia (${totalFiles}) zostały zapisane w naszej ślubnej galerii Google Drive. Dziękujemy!`);
    });
  }

  private triggerConfetti(callback?: () => void): void {
    this.showConfetti = true;
    this.cdr.detectChanges();

    if (this.confettiTimeout) {
      window.clearTimeout(this.confettiTimeout);
    }

    this.confettiTimeout = window.setTimeout(() => {
      this.showConfetti = false;
      this.cdr.detectChanges();
      this.confettiTimeout = undefined;
      if (callback) {
        callback();
      }
    }, 2400);
  }

  scrollToPlan() {
    const element = document.getElementById('plan-dnia');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToMenu() {
    const element = document.getElementById('menu-weselne');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
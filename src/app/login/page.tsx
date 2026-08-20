'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ShieldCheck, UserCheck, Loader2 } from 'lucide-react';

function LoginFormContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para el Modal de Solicitar Acceso
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    city: '',
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const { success } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/lista-precios';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animación interactiva Mobile Smash Bros Arena
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Plataformas estilo Smash
    let mainPlatform = { x: 0, y: 0, w: 0, h: 38 };
    let platLeft = { x: 0, y: 0, w: 0, h: 12 };
    let platRight = { x: 0, y: 0, w: 0, h: 12 };

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Plataforma principal ancha en la parte inferior visible
      const mainW = Math.min(width * 0.88, 900);
      mainPlatform = {
        x: (width - mainW) / 2,
        y: Math.max(height * 0.82, height - 125),
        w: mainW,
        h: 36,
      };

      const subW = Math.min(mainW * 0.25, 170);
      platLeft = {
        x: mainPlatform.x + 35,
        y: mainPlatform.y - 75,
        w: subW,
        h: 12,
      };

      platRight = {
        x: mainPlatform.x + mainW - subW - 35,
        y: mainPlatform.y - 75,
        w: subW,
        h: 12,
      };
    }
    window.addEventListener('resize', resize);
    resize();

    // Marcas Populares de Teléfonos
    const PHONE_BRANDS = [
      { name: 'Apple iPhone', body: '#1f242d', screen: '#ffffff', bezel: '#0f172a', logoType: 'apple' },
      { name: 'Samsung Galaxy', body: '#142850', screen: '#e1f4fd', bezel: '#0c1b33', logoType: 'samsung' },
      { name: 'Xiaomi', body: '#ff6700', screen: '#fff3e0', bezel: '#9c3800', logoType: 'xiaomi' },
      { name: 'Motorola', body: '#001489', screen: '#e6edff', bezel: '#000b4d', logoType: 'motorola' },
      { name: 'Tecno Mobile', body: '#0066ff', screen: '#e0f2fe', bezel: '#003399', logoType: 'tecno' },
      { name: 'itel', body: '#e60000', screen: '#ffebee', bezel: '#990000', logoType: 'itel' },
      { name: 'TCL', body: '#cc0000', screen: '#fff5f5', bezel: '#800000', logoType: 'tcl' },
      { name: 'Google Pixel', body: '#ffffff', screen: '#e8f0fe', bezel: '#5f6368', logoType: 'google' },
      { name: 'Huawei', body: '#d80027', screen: '#ffe5e5', bezel: '#800010', logoType: 'huawei' },
      { name: 'Honor', body: '#00b4d8', screen: '#e0f7fa', bezel: '#005f73', logoType: 'honor' },
      { name: 'Infinix', body: '#10b981', screen: '#ecfdf5', bezel: '#047857', logoType: 'infinix' },
      { name: 'ZTE', body: '#0284c7', screen: '#e0f2fe', bezel: '#0369a1', logoType: 'zte' },
    ];

    const HIT_TEXTS = ['POW!', 'BAM!', 'SMASH!', 'K.O.!', 'METEOR!', 'CRASH!', 'FLY!'];

    // Partículas y Textos flotantes
    const particles: any[] = [];
    const floatTexts: any[] = [];

    class Particle {
      x: number; y: number; vx: number; vy: number; color: string; radius: number; alpha: number; decay: number; gravity: number;
      constructor(x: number, y: number, color: string, speedMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10 * speedMultiplier;
        this.vy = (Math.random() - 0.5) * 10 * speedMultiplier;
        this.color = color || '#ffffff';
        this.radius = Math.random() * 4 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.025 + 0.015;
        this.gravity = 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class FloatingText {
      x: number; y: number; text: string; color: string; vx: number; vy: number; alpha: number; scale: number; decay: number;
      constructor(x: number, y: number, text: string, color: string) {
        this.x = x;
        this.y = y - 20;
        this.text = text;
        this.color = color || '#ffd166';
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -Math.random() * 3 - 2;
        this.alpha = 1;
        this.scale = 0.6;
        this.decay = 0.02;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        if (this.scale < 1.2) this.scale += 0.08;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.font = '900 20px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, 0, 0);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      }
    }

    function spawnBlastExplosion(x: number, y: number, color: string) {
      for (let i = 0; i < 22; i++) {
        particles.push(new Particle(x, y, color, 1.8));
      }
      floatTexts.push(new FloatingText(x, y, 'FALL OUT!', '#ff0055'));
    }

    function spawnImpact(x: number, y: number, color: string, customText?: string) {
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, color));
      }
      const txt = customText || HIT_TEXTS[Math.floor(Math.random() * HIT_TEXTS.length)];
      floatTexts.push(new FloatingText(x, y, txt, color));
    }

    class SmashPhoneFighter {
      id: number; brand: any; w: number; h: number; cornerRadius: number;
      x: number = 0; y: number = 0; vx: number = 0; vy: number = 0;
      damagePercent: number = 0; facing: number = 1; state: string = 'air';
      stateTimer: number = 0; isGrounded: boolean = false; jumpsLeft: number = 2;
      attackCooldown: number = 0; target: any = null; switchTargetTimer: number = 0;
      animFrame: number = 0; expression: string = 'normal'; rotation: number = 0;
      respawnInvuln: number = 60;

      constructor(id: number) {
        this.id = id;
        this.brand = PHONE_BRANDS[id % PHONE_BRANDS.length];
        this.w = 34;
        this.h = 58;
        this.cornerRadius = 7;
        this.respawn(true);
      }

      respawn(initial = false) {
        this.x = mainPlatform.x + mainPlatform.w * (0.15 + 0.7 * Math.random());
        this.y = initial ? mainPlatform.y - this.h / 2 - 20 : -40;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = initial ? 0 : 2.5;
        this.damagePercent = 0;
        this.facing = Math.random() < 0.5 ? 1 : -1;
        this.state = 'air';
        this.stateTimer = 0;
        this.isGrounded = false;
        this.jumpsLeft = 2;
        this.attackCooldown = Math.floor(Math.random() * 60) + 40;
        this.target = null;
        this.switchTargetTimer = Math.floor(Math.random() * 150) + 80;
        this.animFrame = Math.random() * 100;
        this.expression = 'normal';
        this.rotation = 0;
        this.respawnInvuln = 60;
      }

      findTarget(allFighters: SmashPhoneFighter[]) {
        let closest = null;
        let minDist = Infinity;
        for (let f of allFighters) {
          if (f === this || f.y > height + 20) continue;
          let dx = f.x - this.x;
          let dy = f.y - this.y;
          let dist = Math.hypot(dx, dy);
          if (dist < minDist) {
            minDist = dist;
            closest = f;
          }
        }
        this.target = closest;
      }

      takeDamage(dmg: number, knockAngle: number, baseKnock: number) {
        if (this.respawnInvuln > 0) return;
        this.damagePercent += dmg;
        this.expression = 'hurt';
        const knockback = baseKnock * (1 + this.damagePercent / 60);
        this.vx = Math.cos(knockAngle) * knockback;
        this.vy = Math.sin(knockAngle) * knockback;
        this.state = 'hitstun';
        this.stateTimer = Math.min(40, 18 + Math.floor(this.damagePercent / 10));
        this.isGrounded = false;

        if (this.damagePercent > 90) {
          spawnImpact(this.x, this.y, '#ff0055', 'METEOR SMASH!');
        }
      }

      checkPlatformCollision(plat: any) {
        const footY = this.y + this.h / 2 + 18;
        const prevFootY = footY - this.vy;

        if (
          this.vy >= 0 &&
          prevFootY <= plat.y + 6 &&
          footY >= plat.y &&
          this.x >= plat.x &&
          this.x <= plat.x + plat.w
        ) {
          this.y = plat.y - (this.h / 2 + 18);
          this.vy = 0;
          this.isGrounded = true;
          this.jumpsLeft = 2;
          if (this.state === 'air') this.state = 'ground';
          return true;
        }
        return false;
      }

      update(allFighters: SmashPhoneFighter[]) {
        this.animFrame++;
        if (this.respawnInvuln > 0) this.respawnInvuln--;

        if (this.y > height + 80 || this.x < -100 || this.x > width + 100 || this.y < -200) {
          const clampX = Math.max(40, Math.min(width - 40, this.x));
          const clampY = Math.min(height - 40, Math.max(40, this.y));
          spawnBlastExplosion(clampX, clampY, this.brand.body);
          this.respawn();
          return;
        }

        // Gravedad suave
        const gravity = 0.32;
        this.vy += gravity;

        if (this.isGrounded) {
          this.vx *= 0.85;
          this.rotation *= 0.7;
        } else {
          this.vx *= 0.98;
          if (this.state === 'hitstun') {
            this.rotation += 0.18 * Math.sign(this.vx || 1);
          } else if (this.y > mainPlatform.y) {
            this.expression = 'hurt';
            this.rotation = Math.sin(this.animFrame * 0.3) * 0.25;
          } else {
            this.rotation *= 0.9;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        this.isGrounded = false;
        const hitMain = this.checkPlatformCollision(mainPlatform);
        const hitLeft = !hitMain && this.checkPlatformCollision(platLeft);
        const hitRight = !hitMain && !hitLeft && this.checkPlatformCollision(platRight);

        if (!this.isGrounded && this.state === 'ground') {
          this.state = 'air';
        }

        if (this.state === 'hitstun') {
          this.stateTimer--;
          if (this.stateTimer <= 0) {
            this.state = this.isGrounded ? 'ground' : 'air';
            this.expression = 'normal';
          }
          return;
        }

        this.switchTargetTimer--;
        if (!this.target || this.target.damagePercent === undefined || this.target.y > height || this.switchTargetTimer <= 0) {
          this.findTarget(allFighters);
          this.switchTargetTimer = Math.floor(Math.random() * 150) + 80;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        const isOffstage = this.x < mainPlatform.x || this.x > mainPlatform.x + mainPlatform.w;

        if (isOffstage && this.y > mainPlatform.y) {
          const centerStageX = mainPlatform.x + mainPlatform.w / 2;
          this.vx += (centerStageX > this.x ? 1 : -1) * 0.25;
          this.facing = centerStageX > this.x ? 1 : -1;

          if (this.jumpsLeft > 0 && this.vy > 1 && Math.random() < 0.65 && this.y < height - 60) {
            this.vy = -7.2;
            this.jumpsLeft--;
            spawnImpact(this.x, this.y + 20, '#38bdf8', 'JUMP!');
          }
        } else if (this.target) {
          let dx = this.target.x - this.x;
          let dy = this.target.y - this.y;
          let dist = Math.hypot(dx, dy);

          this.facing = dx >= 0 ? 1 : -1;

          if (dist < 55 && this.attackCooldown <= 0) {
            const roll = Math.random();
            const isSmash = roll < 0.4;
            const isMeteor = roll > 0.75;

            this.state = 'attacking';
            this.stateTimer = 22;
            this.expression = 'attack';

            setTimeout(() => {
              if (!this.target) return;
              let curDist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
              if (curDist < 75) {
                let angle;
                if (isMeteor) {
                  angle = Math.PI / 2;
                } else {
                  angle = isSmash ? (this.facing > 0 ? -0.35 : -2.8) : this.facing > 0 ? -0.7 : -2.4;
                }
                let baseKnock = isSmash ? 8 : isMeteor ? 7 : 5;
                let dmg = isSmash ? 16 : 10;

                this.target.takeDamage(dmg, angle, baseKnock);
                spawnImpact(
                  (this.x + this.target.x) / 2,
                  (this.y + this.target.y) / 2,
                  this.brand.screen,
                  isMeteor ? 'METEOR!!' : isSmash ? 'SMASH!!' : 'POW!'
                );
              }
            }, 120);

            this.attackCooldown = Math.floor(Math.random() * 60) + 50;
          } else if (dy < -40 && this.isGrounded && Math.random() < 0.03) {
            this.vy = -7.5;
            this.isGrounded = false;
            this.state = 'air';
          } else if (this.state !== 'attacking') {
            const walkSpeed = 1.3;
            this.vx += (dx >= 0 ? 1 : -1) * 0.35;
            if (Math.abs(this.vx) > walkSpeed) this.vx = Math.sign(this.vx) * walkSpeed;
          }
        }

        if (this.state === 'attacking') {
          this.stateTimer--;
          if (this.stateTimer <= 0) {
            this.state = this.isGrounded ? 'ground' : 'air';
            this.expression = 'normal';
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.facing, 1);

        if (this.respawnInvuln > 0 && Math.floor(this.animFrame / 4) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }

        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = this.brand.bezel;

        const walkCycle = Math.sin(this.animFrame * 0.3);
        const isMoving = Math.abs(this.vx) > 0.5 && this.isGrounded;

        // Piernas
        let legL1 = { x: -7, y: this.h / 2 };
        let legL2 = { x: -10 + (isMoving ? walkCycle * 10 : 0), y: this.h / 2 + 18 };
        let legR1 = { x: 7, y: this.h / 2 };
        let legR2 = { x: 6 - (isMoving ? walkCycle * 10 : 0), y: this.h / 2 + 18 };

        if (!this.isGrounded) {
          legL2 = { x: -12, y: this.h / 2 + 10 };
          legR2 = { x: 12, y: this.h / 2 + 12 };
        } else if (this.state === 'attacking') {
          legR2 = { x: 24, y: this.h / 2 - 2 };
        }

        ctx.beginPath();
        ctx.moveTo(legL1.x, legL1.y);
        ctx.lineTo(legL2.x, legL2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(legR1.x, legR1.y);
        ctx.lineTo(legR2.x, legR2.y);
        ctx.stroke();

        // Chasis Smartphone
        ctx.fillStyle = this.brand.body;
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 8;
        this.roundRect(ctx, -this.w / 2, -this.h / 2, this.w, this.h, this.cornerRadius, true, true);
        ctx.shadowBlur = 0;

        // Pantalla
        const screenMargin = 3.5;
        ctx.fillStyle = this.brand.screen;
        this.roundRect(
          ctx,
          -this.w / 2 + screenMargin,
          -this.h / 2 + screenMargin + 2,
          this.w - screenMargin * 2,
          this.h - screenMargin * 2 - 4,
          this.cornerRadius - 2,
          true,
          false
        );

        // Notch
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -this.h / 2 + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Logos Vectorizados Oficiales
        this.drawBrandLogo(ctx);

        // Cara
        this.drawFace(ctx);

        // Brazos Stickman
        let armL1 = { x: -this.w / 2, y: -2 };
        let armL2 = { x: -this.w / 2 - 10, y: 10 };
        let armR1 = { x: this.w / 2, y: -2 };
        let armR2 = { x: this.w / 2 + 12, y: 8 };

        if (this.state === 'attacking') {
          armR2 = { x: this.w / 2 + 26, y: -4 };
          armL2 = { x: -this.w / 2 - 6, y: -8 };
        } else if (this.state === 'hitstun' || (!this.isGrounded && this.y > mainPlatform.y)) {
          armL2 = { x: -this.w / 2 - 14, y: -16 };
          armR2 = { x: this.w / 2 + 14, y: -16 };
        } else if (isMoving) {
          armL2 = { x: -this.w / 2 - 8 - walkCycle * 6, y: 10 };
          armR2 = { x: this.w / 2 + 8 + walkCycle * 6, y: 10 };
        }

        ctx.strokeStyle = this.brand.bezel;
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.moveTo(armL1.x, armL1.y);
        ctx.lineTo(armL2.x, armL2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(armR1.x, armR1.y);
        ctx.lineTo(armR2.x, armR2.y);
        ctx.stroke();

        ctx.fillStyle = this.brand.bezel;
        ctx.beginPath();
        ctx.arc(armR2.x, armR2.y, 3, 0, Math.PI * 2);
        ctx.arc(armL2.x, armL2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (this.y < height) {
          this.drawSmashPercent(ctx);
        }
      }

      drawBrandLogo(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const logoY = 14;

        switch (this.brand.logoType) {
          case 'apple':
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, logoY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(1, logoY - 5.5, 1.5, 0.8, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.brand.screen;
            ctx.beginPath();
            ctx.arc(3.5, logoY - 0.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'samsung':
            ctx.fillStyle = '#0c2340';
            ctx.beginPath();
            ctx.ellipse(0, logoY, 10, 5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SAMSUNG', 0, logoY);
            break;

          case 'itel':
            ctx.fillStyle = '#e60000';
            ctx.beginPath();
            ctx.ellipse(0, logoY, 8.5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic bold 6px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('itel', 0, logoY);
            break;

          case 'motorola':
            ctx.fillStyle = '#001489';
            ctx.beginPath();
            ctx.arc(0, logoY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(-2, logoY + 1, 2.2, Math.PI, 0);
            ctx.arc(2, logoY + 1, 2.2, Math.PI, 0);
            ctx.stroke();
            break;

          case 'tecno':
            ctx.fillStyle = '#0066ff';
            ctx.font = '900 6px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TECNO', 0, logoY);
            break;

          case 'xiaomi':
            ctx.fillStyle = '#ff6700';
            ctx.fillRect(-4.5, logoY - 4.5, 9, 9);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 6px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('mi', 0, logoY);
            break;

          case 'tcl':
            ctx.fillStyle = '#cc0000';
            ctx.font = '900 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('TCL', 0, logoY);
            break;

          case 'infinix':
            ctx.fillStyle = '#10b981';
            ctx.font = '900 5.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Infinix', 0, logoY);
            break;

          case 'zte':
            ctx.fillStyle = '#0284c7';
            ctx.font = '900 6.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ZTE', 0, logoY);
            break;

          case 'google':
            ctx.strokeStyle = '#4285f4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, logoY, 4, 0.3 * Math.PI, 1.7 * Math.PI, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, logoY);
            ctx.lineTo(4, logoY);
            ctx.stroke();
            break;

          case 'huawei':
            ctx.fillStyle = '#d80027';
            for (let a = 0; a < 6; a++) {
              let angle = (a * Math.PI) / 3;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * 3, logoY + Math.sin(angle) * 3, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          default:
            ctx.fillStyle = '#00b4d8';
            ctx.font = 'bold 6px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('HONOR', 0, logoY);
            break;
        }
        ctx.restore();
      }

      drawFace(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        const faceOffsetY = -6;

        if (this.expression === 'hurt') {
          ctx.beginPath();
          ctx.moveTo(-6, faceOffsetY - 3); ctx.lineTo(-2, faceOffsetY); ctx.lineTo(-6, faceOffsetY + 3);
          ctx.moveTo(6, faceOffsetY - 3); ctx.lineTo(2, faceOffsetY); ctx.lineTo(6, faceOffsetY + 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, faceOffsetY + 7, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.expression === 'attack') {
          ctx.beginPath();
          ctx.moveTo(-7, faceOffsetY - 5); ctx.lineTo(-1, faceOffsetY - 1);
          ctx.moveTo(7, faceOffsetY - 5); ctx.lineTo(1, faceOffsetY - 1);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-3, faceOffsetY + 1, 2, 0, Math.PI * 2);
          ctx.arc(3, faceOffsetY + 1, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeRect(-4, faceOffsetY + 7, 8, 4);
        } else {
          ctx.beginPath();
          ctx.moveTo(-7, faceOffsetY - 4); ctx.lineTo(-2, faceOffsetY - 1);
          ctx.moveTo(7, faceOffsetY - 4); ctx.lineTo(2, faceOffsetY - 1);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-3, faceOffsetY + 1, 2, 0, Math.PI * 2);
          ctx.arc(3, faceOffsetY + 1, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-4, faceOffsetY + 7);
          ctx.lineTo(4, faceOffsetY + 6);
          ctx.stroke();
        }
      }

      drawSmashPercent(ctx: CanvasRenderingContext2D) {
        const py = this.y - this.h / 2 - 12;
        ctx.save();
        ctx.font = '900 13px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';

        let pColor = '#ffffff';
        if (this.damagePercent > 120) pColor = '#ff0055';
        else if (this.damagePercent > 60) pColor = '#ff3838';
        else if (this.damagePercent > 30) pColor = '#facc15';

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${Math.floor(this.damagePercent)}%`, this.x, py);

        ctx.fillStyle = pColor;
        ctx.shadowColor = pColor;
        ctx.shadowBlur = 6;
        ctx.fillText(`${Math.floor(this.damagePercent)}%`, this.x, py);
        ctx.restore();
      }

      roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: boolean, stroke: boolean) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }
    }

    const fighters: SmashPhoneFighter[] = [];
    for (let i = 0; i < 6; i++) {
      fighters.push(new SmashPhoneFighter(i));
    }

    const clouds = [
      { x: width * 0.1, y: 70, s: 0.9, speed: 0.2 },
      { x: width * 0.55, y: 110, s: 1.2, speed: 0.15 },
      { x: width * 0.85, y: 50, s: 0.7, speed: 0.25 },
      { x: width * 0.3, y: 150, s: 1.0, speed: 0.18 },
    ];

    function drawSmashStage(ctx: CanvasRenderingContext2D) {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.35, '#38bdf8');
      skyGrad.addColorStop(0.7, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let c of clouds) {
        c.x += c.speed;
        if (c.x > width + 100) c.x = -120;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 35 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 30 * c.s, c.y - 10 * c.s, 42 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 70 * c.s, c.y, 35 * c.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      drawSubPlatform(platLeft);
      drawSubPlatform(platRight);
      drawMainPlatform(mainPlatform);
    }

    function drawMainPlatform(plat: any) {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(plat.x, plat.y);
      ctx.lineTo(plat.x + plat.w, plat.y);
      ctx.lineTo(plat.x + plat.w - 25, plat.y + plat.h);
      ctx.lineTo(plat.x + plat.w / 2, plat.y + plat.h + 45);
      ctx.lineTo(plat.x + 25, plat.y + plat.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(plat.x, plat.y);
      ctx.lineTo(plat.x + plat.w, plat.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(plat.x + plat.w / 2, plat.y + plat.h + 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawSubPlatform(plat: any) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(plat.x + 6, plat.y);
      ctx.lineTo(plat.x + plat.w - 6, plat.y);
      ctx.stroke();
      ctx.restore();
    }

    function gameLoop() {
      drawSmashStage(ctx);

      fighters.sort((a, b) => a.y - b.y);

      for (let fighter of fighters) {
        fighter.update(fighters);
        fighter.draw(ctx);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      for (let i = floatTexts.length - 1; i >= 0; i--) {
        let ft = floatTexts[i];
        ft.update();
        ft.draw(ctx);
        if (ft.alpha <= 0) floatTexts.splice(i, 1);
      }

      animId = requestAnimationFrame(gameLoop);
    }

    animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const result = await login(identifier, password);
    if (result.success) {
      success('Sesión iniciada correctamente', '¡Bienvenido a YZ DIGITAL!');
      router.push(callbackUrl);
      router.refresh();
    } else {
      setErrorMessage(result.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMessage('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Error al enviar solicitud');
        setRegLoading(false);
        return;
      }

      setRegisterSuccess(true);
      setRegLoading(false);
    } catch (err) {
      setRegError('Ocurrió un error de red. Intenta nuevamente.');
      setRegLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* Canvas Interactivo Smash Bros */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 block cursor-default"
      />

      {/* Contenedor Login con Glassmorphism */}
      <div className="absolute top-[36%] sm:top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[90%] max-w-[380px] p-6 sm:p-7 bg-slate-950/75 backdrop-blur-xl rounded-[24px] border border-white/20 shadow-2xl shadow-black/60 text-white transition-all duration-300 hover:shadow-cyan-500/20">

        {/* Cabecera del Login */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] rounded-2xl mb-2 shadow-lg shadow-sky-500/40 p-1 border border-white/30 overflow-hidden">
            <img
              src="/logo.png"
              alt="YZ DIGITAL"
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => {
                // Fallback icon si aún no carga
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            Iniciar sesión
          </h2>
          <p className="text-[11px] text-sky-200 font-semibold mt-0.5">
            YZ DIGITAL • Smash Arena
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold text-center animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Campo Usuario */}
          <div>
            <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-white text-xs outline-none focus:bg-slate-800 focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-400 select-text"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/15 rounded-xl text-white text-xs outline-none focus:bg-slate-800 focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-400 select-text"
            />
          </div>

          {/* Acciones Recordar / Olvido */}
          <div className="flex items-center justify-between text-[11px] text-sky-200 pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
              />
              <span>Recordarme</span>
            </label>
            <a
              href="https://wa.me/18294636244?text=Hola,%20olvidé%20mi%20contraseña%20de%20acceso%20a%20YZ%20Digital"
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 hover:text-white hover:underline transition-colors font-semibold"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-600/40 hover:shadow-sky-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Entrar al sistema</span>
            )}
          </button>
        </form>

        {/* Enlace Solicitar Acceso */}
        <div className="mt-3.5 text-center text-xs text-sky-200">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setRegisterSuccess(false);
              setRegisterModalOpen(true);
            }}
            className="text-sky-300 font-bold hover:text-white hover:underline transition-colors"
          >
            Solicitar Acceso Mayorista
          </button>
        </div>

        {/* Acceso Rápido de Demostración */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-sky-200/80 uppercase font-bold tracking-wider mb-2">
            Accesos Rápidos de Prueba
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[10px] font-bold text-amber-300 transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('mayorista', 'mayorista123')}
              className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[10px] font-bold text-sky-300 transition-colors flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-sky-400" />
              <span>Mayorista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Solicitar Acceso Mayorista */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setRegisterModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white text-sm font-bold bg-white/10 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {registerSuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 rounded-full mx-auto flex items-center justify-center text-3xl text-emerald-400 shadow-lg shadow-emerald-500/20">
                  ✓
                </div>
                <h3 className="text-xl font-black text-white">
                  ¡Solicitud Enviada con Éxito!
                </h3>
                <p className="text-xs text-sky-200 leading-relaxed">
                  Tu solicitud ha sido recibida. El administrador de <strong>YZ DIGITAL</strong> revisará los datos de tu negocio y activará tu cuenta en breve.
                </p>
                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-left space-y-1 text-xs">
                  <div className="text-slate-400 text-[11px] font-bold uppercase">Usuario Registrado:</div>
                  <div className="font-mono font-bold text-sky-300">{regForm.username}</div>
                  <div className="text-slate-400 text-[11px] font-bold uppercase pt-1">Negocio:</div>
                  <div className="font-bold text-white">{regForm.companyName || 'Mayorista'}</div>
                </div>

                <a
                  href={`https://wa.me/18294636244?text=${encodeURIComponent(
                    `Hola YZ DIGITAL, acabo de solicitar acceso mayorista para mi negocio "${regForm.companyName || regForm.name}" con el usuario "${regForm.username}". Por favor activar mi cuenta.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all block"
                >
                  <span>Avisar al Administrador por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Volver al Inicio de Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Solicitar Acceso Mayorista
                  </h3>
                  <p className="text-xs text-sky-200 mt-1">
                    Completa tus datos comerciales para que activemos tu cuenta de distribución.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold text-center">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                      Nombre Completo / Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                      Nombre de la Tienda o Negocio *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.companyName}
                      onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                      placeholder="Ej: Celulares Pérez / Tienda Móvil"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        placeholder="Ej: 829-463-6244"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Ciudad / Ubicación
                      </label>
                      <input
                        type="text"
                        value={regForm.city}
                        onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                        placeholder="Ej: Santo Domingo"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Usuario Deseado *
                      </label>
                      <input
                        type="text"
                        required
                        value={regForm.username}
                        onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                        placeholder="Ej: juanperez"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-sky-100 uppercase tracking-wider mb-1">
                        Contraseña Deseada *
                      </label>
                      <input
                        type="password"
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#38bdf8] to-[#0284c7] hover:from-[#7dd3fc] hover:to-[#0369a1] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-600/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando Solicitud...</span>
                        </>
                      ) : (
                        <span>Enviar Solicitud de Acceso</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badge Inferior estilo Smash */}
      <div className="absolute bottom-3 left-4 z-10 text-white/85 text-[10px] sm:text-[11px] font-black tracking-widest uppercase pointer-events-none drop-shadow-md">
        💥 SUPER SMARTPHONE SMASH BROS — POPULAR BRANDS
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0284c7] text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import './DynamicBackground.css';

const DynamicBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const connectionsRef = useRef([]);

  // 粒子类
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;

      // 边界反弹
      if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

      // 保持在画布内
      this.x = Math.max(0, Math.min(this.canvas.width, this.x));
      this.y = Math.max(0, Math.min(this.canvas.height, this.y));
    }

    draw(ctx) {
      const pulseRadius = this.radius + Math.sin(this.pulse) * 0.5;
      const pulseOpacity = this.opacity + Math.sin(this.pulse) * 0.2;

      // 绘制粒子核心
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${pulseOpacity})`;
      ctx.fill();

      // 绘制光晕效果
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, pulseRadius * 3
      );
      gradient.addColorStop(0, `rgba(100, 200, 255, ${pulseOpacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  // 连接线类
  class Connection {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.opacity = 0;
      this.maxOpacity = 0.3;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
      const distance = Math.sqrt(
        Math.pow(this.p1.x - this.p2.x, 2) + Math.pow(this.p1.y - this.p2.y, 2)
      );
      
      // 根据距离调整透明度
      if (distance < 150) {
        this.opacity = Math.min(this.maxOpacity, (150 - distance) / 150 * this.maxOpacity);
      } else {
        this.opacity = 0;
      }

      this.pulsePhase += 0.05;
    }

    draw(ctx) {
      if (this.opacity > 0) {
        const pulseOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.1;
        
        // 绘制连接线
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pulseOpacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制数据流动效果
        const midX = (this.p1.x + this.p2.x) / 2;
        const midY = (this.p1.y + this.p2.y) / 2;
        const flowOffset = Math.sin(this.pulsePhase * 2) * 10;
        
        ctx.beginPath();
        ctx.arc(
          midX + Math.cos(Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x)) * flowOffset,
          midY + Math.sin(Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x)) * flowOffset,
          2, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 2})`;
        ctx.fill();
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化粒子
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(canvas));
      }
    };

    initParticles();

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      // 更新连接线
      connectionsRef.current = [];
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const connection = new Connection(particlesRef.current[i], particlesRef.current[j]);
          connection.update();
          connectionsRef.current.push(connection);
        }
      }

      // 绘制连接线
      connectionsRef.current.forEach(connection => {
        connection.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="dynamic-background">
      <canvas
        ref={canvasRef}
        className="background-canvas"
      />
      <div className="background-overlay" />
    </div>
  );
};

export default DynamicBackground;
import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let lastFrame = 0;

        const isMobile = window.innerWidth < 768;

        // Mobile: fewer particles, lower FPS, no connection lines — looks great, won't kill scroll
        const PARTICLE_COUNT = isMobile ? 25 : 60;
        const CONNECTION_DIST = isMobile ? 0 : 120; // no lines on mobile
        const TARGET_FPS = isMobile ? 24 : 40;
        const FRAME_INTERVAL = 1000 / TARGET_FPS;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
                this.vy = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
                this.size = Math.random() * (isMobile ? 1.2 : 1.5) + 0.5;
                this.color = Math.random() > 0.5 ? '#00D4FF' : '#FF6B35';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        };

        const animate = (timestamp) => {
            animationFrameId = requestAnimationFrame(animate);
            if (timestamp - lastFrame < FRAME_INTERVAL) return;
            lastFrame = timestamp;

            ctx.fillStyle = 'rgba(10,10,10,0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (CONNECTION_DIST > 0) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[j].x - particles[i].x;
                        const dy = particles[j].y - particles[i].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < CONNECTION_DIST) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(255,255,255,${0.08 - dist / 1500})`;
                            ctx.lineWidth = 0.4;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
            }
        };

        init();
        animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ willChange: 'transform', touchAction: 'none' }}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            aria-hidden="true"
        />
    );
};

export default ParticleBackground;

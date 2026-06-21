import React, { useEffect, useRef, useState } from 'react';

function Radar3D({ theme = 'dark' }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = 380);
    let height = (canvas.height = 380);
    const centerX = width / 2;
    const centerY = height / 2;

    const isDark = theme === 'dark';
    const bgFillStyle = isDark ? 'rgba(9, 8, 16, 0.15)' : 'rgba(250, 249, 245, 0.15)';
    const gridStrokeStyle = isDark ? 'rgba(130, 87, 230, 0.05)' : 'rgba(58, 80, 72, 0.06)';
    const sweepBeamStrokeStyle = isDark ? 'rgba(130, 87, 230, 0.4)' : 'rgba(58, 80, 72, 0.4)';
    const sweepHaloFillStyle = isDark ? 'rgba(130, 87, 230, 0.015)' : 'rgba(58, 80, 72, 0.015)';
    const textFillStyle = (alpha) => isDark ? `rgba(241, 240, 250, ${alpha})` : `rgba(31, 38, 35, ${alpha})`;
    const shadowColorVal = isDark ? 'rgba(130, 87, 230, 0.6)' : 'rgba(58, 80, 72, 0.2)';

    // Dynamic ring color configurations
    const getRingColor = (rIndex, alpha) => {
      if (rIndex === 0) {
        return isDark ? `rgba(0, 230, 118, ${alpha})` : `rgba(46, 125, 50, ${alpha})`; // Income (Green)
      } else if (rIndex === 1) {
        return isDark ? `rgba(130, 87, 230, ${alpha * 1.5})` : `rgba(58, 80, 72, ${alpha * 1.5})`; // Spend (Purple/Pine)
      } else {
        return isDark ? `rgba(0, 176, 255, ${alpha})` : `rgba(21, 101, 192, ${alpha})`; // Savings (Blue)
      }
    };

    // Generate 3D points
    const points = [];
    const numRings = 3;
    const pointsPerRing = 32;
    const ringRadii = [80, 110, 140];
    const ringInclinations = [0.3, -0.2, 0.6]; // Different tilt for each orbital ring

    for (let r = 0; r < numRings; r++) {
      const radius = ringRadii[r];
      const tilt = ringInclinations[r];
      for (let p = 0; p < pointsPerRing; p++) {
        const angle = (p / pointsPerRing) * Math.PI * 2;
        // Flat circle coordinates
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);
        let z = 0;

        // Apply a tilt (rotation around X axis) to make rings cross
        const cosT = Math.cos(tilt);
        const sinT = Math.sin(tilt);
        const yTilted = y * cosT - z * sinT;
        const zTilted = y * sinT + z * cosT;

        points.push({
          x,
          y: yTilted,
          z: zTilted,
          ring: r,
          index: p
        });
      }
    }

    // Add financial nodes (floating transaction data values around the sphere)
    const floaters = [];
    const financialNodes = [
      { text: '💰 +₹85,000', type: 'income' },
      { text: '💸 -₹12,400', type: 'spend' },
      { text: '💳 -₹2,500', type: 'spend' },
      { text: '📈 +₹15,000', type: 'income' },
      { text: '🏦 ₹58,052', type: 'savings' },
      { text: '🍿 -₹649', type: 'spend' },
      { text: '📶 -₹1,299', type: 'spend' },
      { text: '💰 +₹5,000', type: 'income' },
      { text: '🛍️ ₹27,405', type: 'spend' },
      { text: '🍔 -₹457', type: 'spend' }
    ];

    for (let i = 0; i < financialNodes.length; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 120 + Math.random() * 25; // sphere shell radius

      floaters.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        text: financialNodes[i].text,
        type: financialNodes[i].type
      });
    }

    let angleSweep = 0;
    const fov = 350; // Perspective parameter

    // Animation Loop
    const render = () => {
      // Clear canvas completely to allow the parallax background image to flow through
      ctx.clearRect(0, 0, width, height);

      // Draw background cybernetic grids
      ctx.strokeStyle = gridStrokeStyle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Concentric circles
      for (let d = 40; d < width / 2; d += 40) {
        ctx.arc(centerX, centerY, d, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Slow auto-rotation combined with user rotation
      if (!isDragging.current) {
        rotationRef.current.y += 0.005;
        rotationRef.current.x += 0.001;
      }

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      // 1. Transform and Project Ring Points
      const projectedRings = Array.from({ length: numRings }, () => []);
      
      points.forEach(p => {
        // Rotate around Y axis
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate around X axis
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective Projection
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;

        projectedRings[p.ring].push({
          x: projX,
          y: projY,
          zDepth: z2,
          idx: p.index
        });
      });

      // 2. Draw Ring Connecting Lines with Depth Sorting
      projectedRings.forEach((ringPoints, rIndex) => {
        ctx.lineWidth = rIndex === 1 ? 1.5 : 1;
        ctx.beginPath();
        for (let i = 0; i < ringPoints.length; i++) {
          const p1 = ringPoints[i];
          const p2 = ringPoints[(i + 1) % ringPoints.length];

          // Calculate average depth to style line opacity
          const avgDepth = (p1.zDepth + p2.zDepth) / 2;
          const alpha = Math.max(0.08, Math.min(0.6, (150 - avgDepth) / 300));
          
          ctx.strokeStyle = getRingColor(rIndex, alpha);

          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.beginPath(); // Reset to allow different strokeStyles
        }
      });

      // 3. Draw Radar Sweeping Beam in 3D Space (fading sector slice)
      angleSweep += 0.025;
      const numSweepLines = 40;
      const sweepAngleWidth = 0.6; // Width of sweep wedge in radians
      
      for (let i = 0; i < numSweepLines; i++) {
        const angleOffset = (i / numSweepLines) * sweepAngleWidth;
        const lineAngle = angleSweep - angleOffset;
        const alpha = (1 - i / numSweepLines) * 0.28; // Fade out trailing lines

        const sweepX = Math.cos(lineAngle) * 150;
        const sweepZ = Math.sin(lineAngle) * 150;
        
        let sx1 = sweepX * cosY - sweepZ * sinY;
        let sz1 = sweepX * sinY + sweepZ * cosY;
        let sy2 = 0 * cosX - sz1 * sinX;
        let sz2 = 0 * sinX + sz1 * cosX;

        const sweepScale = fov / (fov + sz2);
        const sweepProjX = centerX + sx1 * sweepScale;
        const sweepProjY = centerY + sy2 * sweepScale;

        ctx.beginPath();
        ctx.strokeStyle = isDark 
          ? `rgba(130, 87, 230, ${alpha})` 
          : `rgba(58, 80, 72, ${alpha})`;
        ctx.lineWidth = i === 0 ? 2 : 1.5; // Stronger leading edge line
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(sweepProjX, sweepProjY);
        ctx.stroke();
      }

      // Render outer circular boundary ring on canvas
      ctx.beginPath();
      ctx.strokeStyle = gridStrokeStyle;
      ctx.lineWidth = 1;
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Transform and Render Floating Financial Nodes
      const projectedFloaters = floaters.map(f => {
        let x1 = f.x * cosY - f.z * sinY;
        let z1 = f.x * sinY + f.z * cosY;
        let y2 = f.y * cosX - z1 * sinX;
        let z2 = f.y * sinX + z1 * cosX;

        const scale = fov / (fov + z2);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          zDepth: z2,
          text: f.text,
          type: f.type,
          scale
        };
      });

      // Depth sort floaters so back objects are rendered first
      projectedFloaters.sort((a, b) => b.zDepth - a.zDepth);

      projectedFloaters.forEach(f => {
        // Opacity based on depth
        const alpha = Math.max(0.15, Math.min(0.9, (180 - f.zDepth) / 360));
        
        // Color based on type (green for credit, pink/red for spend, blue for savings/alert)
        let nodeColor;
        if (f.type === 'income') {
          nodeColor = isDark ? `rgba(0, 230, 118, ${alpha})` : `rgba(46, 125, 50, ${alpha})`;
        } else if (f.type === 'spend') {
          nodeColor = isDark ? `rgba(255, 23, 68, ${alpha})` : `rgba(200, 122, 97, ${alpha})`;
        } else {
          nodeColor = isDark ? `rgba(0, 176, 255, ${alpha})` : `rgba(31, 38, 35, ${alpha})`;
        }
        ctx.fillStyle = nodeColor;
        
        // Font size based on perspective scale
        const fontSize = Math.max(8, Math.min(11, 9.5 * f.scale));
        ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Give background glow to text nodes
        ctx.shadowColor = f.type === 'income' ? 'rgba(0, 230, 118, 0.4)' : f.type === 'spend' ? 'rgba(255, 23, 68, 0.4)' : shadowColorVal;
        ctx.shadowBlur = f.zDepth < 0 ? 6 : 1;
        
        ctx.fillText(f.text, f.x, f.y);
        ctx.shadowBlur = 0; // Reset shadow
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  // Handle Dragging / Rotating globe with mouse
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    // Update rotation angles based on mouse movement
    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div 
      className="radar-3d-wrapper animate-fade-in"
      style={{
        position: 'relative',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' 
          ? 'radial-gradient(circle, rgba(130, 87, 230, 0.03) 0%, rgba(9, 8, 16, 0) 70%)'
          : 'radial-gradient(circle, rgba(58, 80, 72, 0.03) 0%, rgba(250, 249, 245, 0) 70%)',
        borderRadius: 'var(--radius-full)',
        border: theme === 'dark' 
          ? '1px solid rgba(130, 87, 230, 0.12)'
          : '1px solid rgba(58, 80, 72, 0.15)',
        boxShadow: theme === 'dark'
          ? '0 8px 32px rgba(9, 8, 16, 0.3), inset 0 0 20px rgba(130, 87, 230, 0.05)'
          : '0 8px 32px rgba(58, 80, 72, 0.05), inset 0 0 20px rgba(58, 80, 72, 0.02)',
        transition: 'transform var(--transition-normal), border var(--transition-normal), background var(--transition-normal), box-shadow var(--transition-normal)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDragging.current = false;
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          filter: isHovered 
            ? (theme === 'dark' ? 'drop-shadow(0 0 15px rgba(130, 87, 230, 0.15))' : 'drop-shadow(0 0 15px rgba(58, 80, 72, 0.15))')
            : 'none',
          transition: 'filter var(--transition-normal)'
        }}
      />
      {/* Floating sweep text info details */}
      <div 
        style={{
          position: 'absolute',
          bottom: '42px',
          fontSize: '0.62rem',
          fontFamily: 'var(--font-mono)',
          color: theme === 'dark' ? 'var(--color-primary-light)' : 'var(--color-primary)',
          background: theme === 'dark' ? 'rgba(20, 18, 43, 0.75)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          pointerEvents: 'none',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          boxShadow: 'var(--shadow-sm)',
          transition: 'color var(--transition-normal), background var(--transition-normal), border var(--transition-normal)'
        }}
      >
        🛰️ RADAR_SCAN_ACTIVE
      </div>
    </div>
  );
}

export default Radar3D;

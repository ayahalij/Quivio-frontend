// src/components/common/QuivioLoader.jsx
import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// Animation keyframes
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const wave = keyframes`
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-15px);
  }
`;

const QuivioLoader = ({ 
  variant = 'bouncing-dots', 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const sizeMap = {
    small: { container: 60, dot: 8, text: '0.9rem' },
    medium: { container: 80, dot: 12, text: '1.1rem' },
    large: { container: 120, dot: 16, text: '1.3rem' }
  };

  const currentSize = sizeMap[size];

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 254, 251, 0.95)',
      zIndex: 9999,
      minHeight: '100vh'
    })
  };

  const renderBouncingDots = () => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: currentSize.dot,
            height: currentSize.dot,
            borderRadius: '50%',
            backgroundColor: '#8761a7',
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </Box>
  );

  const renderQuivioSpinner = () => (
    <Box sx={{ position: 'relative', width: currentSize.container, height: currentSize.container }}>
      {/* Outer ring */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `3px solid #dce291`,
          borderTop: `3px solid #8761a7`,
          borderRadius: '50%',
          animation: `${spin} 1s linear infinite`,
        }}
      />
      {/* Inner circle with Q */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: currentSize.container * 0.6,
          height: currentSize.container * 0.6,
          borderRadius: '50%',
          backgroundColor: '#cdd475',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Kalam", cursive',
            fontWeight: 700,
            fontSize: currentSize.container * 0.25,
            color: '#8761a7',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          Q
        </Typography>
      </Box>
    </Box>
  );

  const renderWaveText = () => {
    const letters = message.split('');
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 2 }}>
        {letters.map((letter, index) => (
          <Typography
            key={index}
            sx={{
              fontFamily: '"Kalam", cursive',
              fontSize: currentSize.text,
              fontWeight: 600,
              color: '#8761a7',
              animation: `${wave} 1.2s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderPulsingCircles = () => (
    <Box sx={{ position: 'relative', width: currentSize.container, height: currentSize.container }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: (index + 1) * (currentSize.container / 3),
            height: (index + 1) * (currentSize.container / 3),
            borderRadius: '50%',
            border: `2px solid ${index === 0 ? '#8761a7' : index === 1 ? '#cdd475' : '#dce291'}`,
            animation: `${pulse} 1.5s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: currentSize.container * 0.2,
          color: '#8761a7',
        }}
      >
        ✨
      </Box>
    </Box>
  );

  const renderFloatingDots = () => (
    <Box sx={{ position: 'relative', width: currentSize.container, height: currentSize.container }}>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index * 72 * Math.PI) / 180;
        const radius = currentSize.container / 3;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              width: currentSize.dot,
              height: currentSize.dot,
              borderRadius: '50%',
              backgroundColor: index % 2 === 0 ? '#8761a7' : '#cdd475',
              animation: `${bounce} 1.5s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        );
      })}
    </Box>
  );

  const renderTypingDots = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        sx={{
          fontFamily: '"Kalam", cursive',
          fontSize: currentSize.text,
          fontWeight: 600,
          color: '#8761a7',
          mr: 1
        }}
      >
        Loading
      </Typography>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#8761a7',
            animation: `${bounce} 1.4s infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return renderQuivioSpinner();
      case 'wave-text':
        return renderWaveText();
      case 'pulsing-circles':
        return renderPulsingCircles();
      case 'floating-dots':
        return renderFloatingDots();
      case 'typing-dots':
        return renderTypingDots();
      default:
        return renderBouncingDots();
    }
  };

  return (
    <Box sx={containerStyle}>
      {renderLoader()}
      {variant !== 'wave-text' && variant !== 'typing-dots' && (
        <Typography
          sx={{
            fontFamily: '"Kalam", cursive',
            fontSize: currentSize.text,
            fontWeight: 600,
            color: '#8761a7',
            textAlign: 'center',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default QuivioLoader;
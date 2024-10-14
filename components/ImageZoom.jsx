import React, { useState } from 'react';

const ImageZoom = ({ imgSrc }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 44, y: 56 });

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setPosition({ x: offsetX, y: offsetY });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
  };

  const imageStyle = {
    width: '300px', 
    height: 'auto',
    cursor: 'zoom-in',
  };

  const zoomBoxSize = 500;

  const zoomBoxStyle = {
    position: 'absolute',
    width: `${zoomBoxSize}px`,
    height: `${zoomBoxSize}px`,
    border: '1px solid gray',
    borderRadius: '5px',
    backgroundImage: `url(${imgSrc})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '600px 600px', // Adjust based zoom level
    bottom:0,
    left:90,
    padding:4,
    // Update background position for zoom effect
    backgroundPosition: `-${(position.x * 2)}px -${(position.y * 2)}px`,
    pointerEvents: 'none', // Disable interaction
    zIndex: 10,
  };

  return (
    <div style={containerStyle}>
      <img
        src={imgSrc}
        alt="Zoomable"
        style={imageStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {isZoomed && <div style={zoomBoxStyle} />}
    </div>
  );
};

export default ImageZoom;


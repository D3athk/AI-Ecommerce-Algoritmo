import React, { useState, useEffect } from 'react';

const Carousel = ({ intervalTime }) => {
  const images = [
    '/assets/imagem/slide1.jpg',
    '/assets/imagem/slide2.jpg',
    '/assets/imagem/slide3.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Função para passar para a próxima imagem
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(nextImage, intervalTime);

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar ou alterar
  }, [intervalTime]); // O efeito é ativado sempre que intervalTime mudar

  return (
    <div className="text-center mt-4 position-relative">
      <img
        src={images[currentImageIndex]}
        alt={`Slide ${currentImageIndex + 1}`}
        className="img-fluid"
        style={{ maxHeight: '207px', margin: '0 auto' }}
      />
    </div>
  );
};

export default Carousel;

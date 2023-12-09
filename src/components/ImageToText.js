import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const ImageToTextConverter = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImage(reader.result);

        // Perform OCR on the image
        const { data: { text } } = await Tesseract.recognize(
          reader.result,
          'eng', // Specify language code
          { logger: (info) => console.log(info) } // Optional logger
        );

        setText(text);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      {image && <img src={image} alt="Uploaded" style={{ maxWidth: '100%' }} />}
      {text && <div>Extracted Text: {text}</div>}
    </div>
  );
};

export default ImageToTextConverter;

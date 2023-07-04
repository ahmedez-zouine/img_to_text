import React, { useState, useEffect } from 'react';
import { View, Button, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { TesseractWorker } from 'tesseract.js';

const worker = new TesseractWorker();

const App = () => {
  const [text, setText] = useState('');
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    // Demander l'autorisation d'accéder à la galerie d'images
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied for accessing media library');
      }
    })();
  }, []);

  const handleImageSelection = async () => {
    try {
      const { uri, cancelled } = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!cancelled) {
        const path = `${FileSystem.documentDirectory}image.jpg`;
        await FileSystem.copyAsync({ from: uri, to: path });
        setImagePath(path);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const extractTextFromImage = async (imagePath) => {
    try {
      const imageUri = `${FileSystem.documentDirectory}image.jpg`;

      const { text } = await worker.recognize(imageUri, 'eng');
      setText(text);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  const handleTextExtraction = () => {
    if (imagePath) {
      extractTextFromImage(imagePath)
        .catch((error) => {
          console.error('Error extracting text:', error);
        });
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Select Image" onPress={handleImageSelection} />
      {imagePath && (
        <>
          <Image source={{ uri: imagePath }} style={{ width: 200, height: 200, marginVertical: 20 }} />
          <Button title="Extract Text" onPress={handleTextExtraction} />
        </>
      )}
      <Text>{text}</Text>
    </View>
  );
};

export default App;


import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';

const CreateScreen = () => {
  const [thoughts, setThoughts] = useState('');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [city, setCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  // 重置表单的函数
  const resetForm = () => {
    setThoughts('');
    setLocation(null);
    setImage(null);
    setCity('');
    setIsEditing(false);
    setEditIndex(null);
  };

  // 当屏幕获得焦点时检查是否有编辑数据
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.record) {
        const { record, index } = route.params;
        setThoughts(record.thoughts);
        setLocation({
          coords: {
            latitude: record.latitude,
            longitude: record.longitude,
          },
        });
        setImage(record.image);
        setCity(record.city);
        setIsEditing(true);
        setEditIndex(index);
      } else {
        resetForm();
      }
    }, [route.params])
  );

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to get your location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        setCity(address[0].city || address[0].region);
      }
      setLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is needed to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const saveRecord = async () => {
    try {
      if (!thoughts || !location || !image) {
        Alert.alert('Required Fields', 'Please fill in your thoughts and add location and image');
        return;
      }

      const batteryLevel = await Battery.getBatteryLevelAsync();
      const record = {
        thoughts,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city,
        image,
        batteryLevel: isEditing ? route.params.record.batteryLevel : Math.round(batteryLevel * 100),
        timestamp: isEditing ? route.params.record.timestamp : new Date().toISOString(),
      };

      const existingRecords = await AsyncStorage.getItem('travelRecords');
      const records = existingRecords ? JSON.parse(existingRecords) : [];

      if (isEditing && editIndex !== null) {
        records[editIndex] = record;
      } else {
        records.push(record);
      }

      await AsyncStorage.setItem('travelRecords', JSON.stringify(records));

      Alert.alert('Success', isEditing ? 'Record updated successfully' : 'Record saved successfully');
      resetForm();
      navigation.navigate('List');
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', isEditing ? 'Failed to update record' : 'Failed to save record');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your thoughts..."
        value={thoughts}
        onChangeText={setThoughts}
        multiline
      />
      
      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>
          {location ? `Location: ${city}` : 'Get Location'}
        </Text>
      </TouchableOpacity>

      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <Image source={{ uri: image }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={saveRecord}
      >
        <Text style={styles.buttonText}>
          {isEditing ? 'Update Record' : 'Save Record'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
});

export default CreateScreen; 
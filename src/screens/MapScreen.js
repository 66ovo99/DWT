import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapRef, setMapRef] = useState(null);

  // 获取位置权限和当前位置
  useFocusEffect(
    React.useCallback(() => {
      const getLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      };

      getLocationPermission();
      loadMarkers(); // 每次屏幕获得焦点时重新加载标记点
    }, [])
  );

  const loadMarkers = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem('travelRecords');
      if (savedRecords) {
        setMarkers(JSON.parse(savedRecords));
      } else {
        setMarkers([]); // 如果没有记录，清空标记点
      }
    } catch (error) {
      console.error('Error loading markers:', error);
      setMarkers([]); // 发生错误时也清空标记点
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef) {
      mapRef.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={ref => setMapRef(ref)}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
          />
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.city}
            >
              {marker.image && (
                <Image
                  source={{ uri: marker.image }}
                  style={styles.markerImage}
                />
              )}
            </Marker>
          ))}
        </MapView>
      )}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerOnUserLocation}
      >
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapScreen; 
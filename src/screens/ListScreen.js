import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ListScreen = () => {
  const [records, setRecords] = useState([]);
  const navigation = useNavigation();

  const loadRecords = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem('travelRecords');
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        // 按时间倒序排序
        parsedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRecords(parsedRecords);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  // 使用 useFocusEffect 在屏幕获得焦点时刷新数据
  useFocusEffect(
    React.useCallback(() => {
      loadRecords();
    }, [])
  );

  const handleDelete = async (index) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const newRecords = records.filter((_, i) => i !== index);
              await AsyncStorage.setItem('travelRecords', JSON.stringify(newRecords));
              setRecords(newRecords);
              Alert.alert('Success', 'Record deleted successfully');
              // 强制重新加载记录
              loadRecords();
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (record, index) => {
    navigation.navigate('Create', { record, index });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onLongPress={() => {
        Alert.alert(
          'Record Options',
          'What would you like to do?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Edit',
              onPress: () => handleEdit(item, index),
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => handleDelete(index),
            },
          ]
        );
      }}
    >
      <Image source={{ uri: item.image }} style={styles.recordImage} />
      <View style={styles.recordInfo}>
        <Text style={styles.city}>{item.city}</Text>
        <Text style={styles.coordinates}>
        Longitude: {item.longitude.toFixed(4)} Latitude: {item.latitude.toFixed(4)}
        </Text>
        <Text style={styles.thoughts}>{item.thoughts}</Text>
        <Text style={styles.battery}>Battery: {item.batteryLevel}%</Text>
        <Text style={styles.date}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item, index)}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(index)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No records yet{'\n'}Waiting for your creation ξ( ✿＞◡❛)!</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Create')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recordItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  recordInfo: {
    gap: 5,
  },
  city: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
  },
  thoughts: {
    fontSize: 16,
    color: '#444',
    marginTop: 5,
  },
  battery: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  editButton: {
    backgroundColor: '#E5F1FF',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ListScreen; 
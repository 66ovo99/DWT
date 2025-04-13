import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import CreateScreen from './src/screens/CreateScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'List') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Create') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Map" 
          component={MapScreen}
          options={{
            title: 'Map',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
          }}
        />
        <Tab.Screen 
          name="List" 
          component={ListScreen}
          options={{
            title: 'Records',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
          }}
        />
        <Tab.Screen 
          name="Create" 
          component={CreateScreen}
          options={{
            title: 'New Record',
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 
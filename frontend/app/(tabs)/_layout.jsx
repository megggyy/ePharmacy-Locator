import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import AuthGlobal from '@/context/AuthGlobal';

export default function TabLayout() {
  const { state } = useContext(AuthGlobal);
  const colorScheme = useColorScheme();

  return (
    <Tabs
      // Adding a key ensures the Tabs component re-renders when isAuthenticated changes
      key={state.isAuthenticated}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#005b7f', // Set the background color here
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pharmacies"
        options={{
          title: 'Pharmacies',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'business' : 'business-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: 'Medications',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'briefcase' : 'briefcase-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Maps',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />

      {state.isAuthenticated == false && (
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}

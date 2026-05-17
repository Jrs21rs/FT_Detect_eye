import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { profile } from '../config/env';

export default function DevelopmentNav() {
  if (!profile.isDevelopment) return null;

  const navigateTo = (route: any) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/')}
      >
        <Text style={styles.navText}>Index</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/login')}
      >
        <Text style={styles.navText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/register')}
      >
        <Text style={styles.navText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/(tabs)/home')}
      >
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/(tabs)/profile')}
      >
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/(tabs)/updateProfile')}
      >
        <Text style={styles.navText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/(tabs)/PatientRegistrationForm')}
      >
        <Text style={styles.navText}>Patient</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo('/(tabs)/clinicalHistory')}
      >
        <Text style={styles.navText}>History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4c669f',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

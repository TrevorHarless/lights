import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// Simple test to ensure testing setup works
describe('App Setup', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should render React Native Text component', () => {
    render(
      <View>
        <Text>Hello Test</Text>
      </View>
    );
    
    expect(screen.getByText('Hello Test')).toBeTruthy();
  });

  it('should support modern testing library queries', () => {
    render(
      <View testID="test-container">
        <Text>Testing React Native components</Text>
      </View>
    );
    
    const container = screen.getByTestId('test-container');
    expect(container).toBeTruthy();
    expect(screen.getByText('Testing React Native components')).toBeTruthy();
  });
});
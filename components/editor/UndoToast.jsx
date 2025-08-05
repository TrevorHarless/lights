// import { MaterialIcons } from '@expo/vector-icons';
// import React, { useEffect, useRef } from 'react';
// import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// export const UndoToast = ({ visible, message, onUndo, duration = 5000 }) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;

//   useEffect(() => {
//     if (visible) {
//       // Animate in
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       // Animate out
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(slideAnim, {
//           toValue: 50,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible, fadeAnim, slideAnim]);

//   if (!visible && fadeAnim._value === 0) return null;

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         {
//           opacity: fadeAnim,
//           transform: [{ translateY: slideAnim }],
//         },
//       ]}>
//       <View style={styles.content}>
//         <Text style={styles.message}>{message}</Text>
//         <TouchableOpacity onPress={onUndo} style={styles.button}>
//           <MaterialIcons name="undo" size={16} color="#fff" />
//           <Text style={styles.buttonText}>UNDO</Text>
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     borderRadius: 8,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//     zIndex: 9999,
//   },
//   content: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//   },
//   message: {
//     color: '#fff',
//     flex: 1,
//     marginRight: 8,
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//     backgroundColor: '#007aff',
//   },
//   buttonText: {
//     color: '#fff',
//     marginLeft: 4,
//     fontWeight: 'bold',
//   },
// });

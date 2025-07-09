import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const avatarSources = [
  require('../assets/avatars/avatar1.jpg'),
  require('../assets/avatars/avatar2.jpg'),
  require('../assets/avatars/avatar3.jpg'),
  require('../assets/avatars/avatar4.jpg'),
  require('../assets/avatars/avatar5.jpg'),
  require('../assets/avatars/avatar6.jpg'),
  require('../assets/avatars/avatar7.jpg'),
  require('../assets/avatars/avatar8.jpg'),
  require('../assets/avatars/avatar9.jpg'),
];

export default function AvatarSelector({ selected, onSelect }: { selected: number | null, onSelect: (idx: number) => void }) {
  return (
    <View style={styles.grid}>
      {avatarSources.map((src, idx) => (
        <TouchableOpacity key={idx} onPress={() => onSelect(idx)}>
          <Image
            source={src}
            style={[
              styles.avatar,
              selected === idx && styles.selectedAvatar,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    margin: 8,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedAvatar: {
    borderColor: '#1D3D47',
    borderWidth: 3,
  },
}); 
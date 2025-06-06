import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const publicaciones = [
  {
    id: '1',
    image: require('../assets/feed/motivation-vs-discipline.jpg'),
    texto: 'La motivación es fugaz. La disciplina es constante.',
  },
  {
    id: '2',
    image: require('../assets/feed/anthony-edwards.jpg'),
    texto: 'The only failure is not to try.',
  },
  {
    id: '3',
    image: require('../assets/feed/discipline-definition.jpg'),
    texto: 'Haz lo difícil como si lo amaras.',
  },
  {
    id: '4',
    image: require('../assets/feed/lebron-winner.jpg'),
    texto: 'Winning is the only option.',
  },
  {
    id: '5',
    image: require('../assets/feed/consistency.png'),
    texto: 'La constancia no es hacerlo perfecto, es hacerlo siempre.',
  },
];

const FeedScreen = () => {
  const [likes, setLikes] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLikes((prev) =>
      prev.includes(id) ? prev.filter((likeId) => likeId !== id) : [...prev, id]
    );
  };

  return (
    <FlatList
      data={publicaciones}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.feedContent}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={styles.textContainer}>
            <Text style={styles.texto}>{item.texto}</Text>
            <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
              <Ionicons
                name={likes.includes(item.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={likes.includes(item.id) ? '#e0245e' : '#888'}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  feedContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: width * 0.9

   ,
  },
  textContainer: {
    padding: 12,
    position: 'relative',
  },
  texto: {
    fontSize: 14,
    color: '#222',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  likeButton: {
    position: 'absolute',
    top: -28,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

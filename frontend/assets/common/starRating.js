import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const StarRating = ({ rating, onChangeRating }) => {
  const [selectedRating, setSelectedRating] = useState(rating);

  const handleRatingPress = (newRating) => {
    setSelectedRating(newRating);
    onChangeRating(newRating);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleRatingPress(index)}
          style={styles.starButton}
        >
          <Icon
            name={selectedRating >= index ? "star" : "star-o"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  starButton: {
    marginHorizontal: 5,
  },
});

export default StarRating;
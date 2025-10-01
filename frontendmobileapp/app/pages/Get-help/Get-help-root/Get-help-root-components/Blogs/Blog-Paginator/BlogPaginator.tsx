import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./BlogPaginatorStyles";


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
 
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.disabled]}
        onPress={handlePrev}
        disabled={currentPage === 1}
      >
        <Text style={styles.buttonText}>Prev</Text>
      </TouchableOpacity>

      <Text style={styles.pageLabel}>
        Page {currentPage} of {totalPages}
      </Text>

      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.disabled]}
        onPress={handleNext}
        disabled={currentPage === totalPages}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};



export default Pagination;


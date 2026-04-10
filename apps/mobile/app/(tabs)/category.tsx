import { View, Text, StyleSheet } from 'react-native';

export default function CategoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>카테고리</Text>
        <Text style={styles.description}>
          생활/주방, 패션/의류, 전자/디지털, 뷰티/건강, 문구/완구, 스포츠, 반려동물, 공구/산업, 인테리어 등
          다양한 카테고리의 상품을 탐색하세요.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Monorepo 공유 패키지</Text>
        <Text style={styles.infoText}>
          카테고리 데이터 구조와 타입은 packages/shared에서 정의되어 웹과 모바일에서 동일하게 사용됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f8',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#b320080d',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#b320081a',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b32008',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
  },
});

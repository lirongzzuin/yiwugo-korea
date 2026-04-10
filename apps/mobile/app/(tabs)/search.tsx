import { View, Text, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>검색</Text>
        <Text style={styles.description}>
          키워드 검색, 이미지 검색으로 원하는 상품을 찾아보세요.
          한국어로 검색하면 자동으로 중국어 번역되어 이우 시장 상품을 검색합니다.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Monorepo 공유 패키지</Text>
        <Text style={styles.infoText}>
          검색 API 클라이언트와 상품 타입 정의는 packages/shared에서 관리됩니다.
          UI 컴포넌트는 packages/ui에서 플랫폼별로 렌더링됩니다.
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

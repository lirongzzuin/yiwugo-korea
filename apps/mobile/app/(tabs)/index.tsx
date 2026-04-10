import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>이우고 코리아</Text>
        <Text style={styles.brandSubtext}>YiwuGo Korea</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>홈</Text>
        <Text style={styles.cardDescription}>
          중국 이우 시장 200만개 상품을 한국에서 쉽고 안전하게 도매 구매하세요.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Monorepo 공유 패키지</Text>
        <Text style={styles.infoText}>
          이 앱은 packages/shared와 packages/ui의 공통 로직과 컴포넌트를 공유합니다.
          비즈니스 로직, 타입 정의, 유틸리티 함수를 모노레포에서 통합 관리합니다.
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
  brandContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#b32008',
  },
  brandSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
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

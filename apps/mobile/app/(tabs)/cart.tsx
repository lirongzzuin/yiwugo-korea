import { View, Text, StyleSheet } from 'react-native';

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>장바구니</Text>
        <Text style={styles.description}>
          여러 상점의 상품을 장바구니에 담아 한 번에 주문하세요.
          합포장으로 배송비를 절약할 수 있습니다.
        </Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>shopping_cart</Text>
        <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
        <Text style={styles.emptySubtext}>마음에 드는 상품을 담아보세요</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Monorepo 공유 패키지</Text>
        <Text style={styles.infoText}>
          장바구니 상태 관리(Zustand store)와 가격/환율 계산 로직은
          packages/shared에서 웹과 모바일이 동일하게 사용합니다.
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 12,
  },
  emptyIcon: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: 48,
    color: '#d1d5db',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#d1d5db',
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

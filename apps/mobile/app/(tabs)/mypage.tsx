import { View, Text, StyleSheet } from 'react-native';

export default function MyPageScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>person</Text>
        </View>
        <Text style={styles.name}>게스트</Text>
        <Text style={styles.email}>로그인하여 모든 기능을 이용하세요</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>마이페이지</Text>
        <Text style={styles.description}>
          주문/배송 조회, 관심상품, 쿠폰함, 적립금 내역, 배송지 관리,
          개인통관고유부호 등록 등의 기능을 이용할 수 있습니다.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Monorepo 공유 패키지</Text>
        <Text style={styles.infoText}>
          사용자 인증 로직, 주문 상태 타입, API 클라이언트는
          packages/shared에서 관리되어 웹과 모바일에서 일관된 경험을 제공합니다.
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
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#b320081a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: 32,
    color: '#b32008',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#9ca3af',
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

import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: 'Material Symbols Outlined',
        fontSize: 24,
        color: focused ? '#b32008' : '#9ca3af',
      }}
    >
      {name}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#b32008',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fcf9f8',
          borderTopColor: '#e5e5e5',
          height: 56,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: '#fcf9f8' },
        headerTintColor: '#1a1a1a',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: '카테고리',
          tabBarIcon: ({ focused }) => <TabIcon name="category" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: '장바구니',
          tabBarIcon: ({ focused }) => <TabIcon name="shopping_cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

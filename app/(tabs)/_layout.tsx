import { Ionicons } from '@expo/vector-icons'; // İkon kütüphanesi
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Üstteki başlık çubuğu görünsün mü?
        tabBarActiveTintColor: '#007AFF', // Seçili sekme rengi
        tabBarInactiveTintColor: 'gray',  // Pasif sekme rengi
      }}
    >
      {/* 1. Ana Sayfa */}
      <Tabs.Screen
        name="index" // Dosya adı (index.tsx'e bakar)
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      {/* 2. Hedefler */}
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Hedefler',
          tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
        }}
      />

      {/* 3. Planlayıcı (Ortadaki ana buton gibi düşünebiliriz) */}
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planla',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />

      {/* 4. Kalori */}
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Alıskanlık',
          tabBarIcon: ({ color }) => <Ionicons name="nutrition" size={24} color={color} />,
        }}
      />

      {/* 5. Harcamalar */}
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Harcama',
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
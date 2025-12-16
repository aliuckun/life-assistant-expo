import { Redirect } from 'expo-router';

export default function Index() {
    // Uygulama açılınca otomatik olarak tabs içindeki index'e yönlendir
    return <Redirect href="/(tabs)" />;
}
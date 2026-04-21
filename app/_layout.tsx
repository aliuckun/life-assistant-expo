import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { Appearance, Image, StyleSheet, View } from 'react-native';

Appearance.setColorScheme('light');

export default function RootLayout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!ready) {
        return (
            <View style={styles.splash}>
                <Image
                    source={require('../src/assets/images/bcg.png')}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return <Slot />;
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
import React, { useState } from 'react';
import { collection, query, where, getDocs, QuerySnapshot, QueryDocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { theme, customTheme } from '../../styles/theme';

const AdminNotificationPanel = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const sendNotificationToAllUsers = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Eksik Bilgi', 'Başlık ve mesaj giriniz.');
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(firestore, 'users'), where('expoPushToken', '!=', null));
const usersSnapshot = await getDocs(q);
      const tokens = usersSnapshot.docs.map(doc => doc.data().expoPushToken).filter(Boolean);
      if (tokens.length === 0) {
        Alert.alert('Bildirim Yok', 'Hiçbir kullanıcıda push token yok.');
        setLoading(false);
        return;
      }
      // Expo push API'ye istek at
      const chunks = [];
      const chunkSize = 100; // Expo'nun limiti
      for (let i = 0; i < tokens.length; i += chunkSize) {
        chunks.push(tokens.slice(i, i + chunkSize));
      }
      for (const chunk of chunks) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
          }))),
        });
      }
      setTitle('');
      setBody('');
      Alert.alert('Başarılı', 'Bildirimler gönderildi!');
    } catch (e) {
      Alert.alert('Hata', 'Bildirim gönderilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.panelContainer}>
      <Text style={styles.panelTitle}>Tüm Kullanıcılara Bildirim Gönder</Text>
      <TextInput
        style={styles.input}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Mesaj"
        value={body}
        onChangeText={setBody}
        multiline
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendNotificationToAllUsers}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.sendButtonText}>Gönder</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  panelContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: customTheme.spacing.l,
    marginVertical: customTheme.spacing.l,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: customTheme.spacing.m,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: customTheme.spacing.s,
    marginBottom: customTheme.spacing.m,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: customTheme.spacing.m,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default AdminNotificationPanel;

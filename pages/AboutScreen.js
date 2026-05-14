import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function AboutScreen() {
    // 1. Kumpulan State
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [mahasiswa, setMahasiswa] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Referensi untuk memicu jepretan kamera
    const cameraRef = useRef(null);

    const NIM_USER = "0325260031"; // Simulasi NIM Mahasiswa
    const BASE_URL = "http://10.1.14.166:8080/api/mahasiswa";

    // 2. Load Foto dari API
    useEffect(() => {
        fetchMahasiswa();
    }, []);

    // 3. Fungsi GET DATA DARI API
    const fetchMahasiswa = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/${NIM_USER}`);
            if (response.ok) {
                const data = await response.json();
                setMahasiswa(data);
            } else {
                // If the server returns an error (e.g., 404), show a user-friendly message
                if (response.status === 404) {
                    Alert.alert("Error", "Data mahasiswa tidak ditemukan.");
                } else {
                    Alert.alert("Error", `Gagal mengambil data mahasiswa (status ${response.status}).`);
                }
                console.error("Gagal mengambil data mahasiswa", response.status);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Fungsi untuk Mengambil Foto
    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.3 }); // low quality to reduce size & speed up upload
                uploadPhoto(photo.uri);
            } catch (error) {
                Alert.alert("Error", "Gagal mengambil foto.");
            }
        }
    };

    // 5. UPLOAD FOTO KE API (Multipart Form Data)
    const uploadPhoto = async (uri) => {
        setIsLoading(true);

        // Buat objek FormData (Standar untuk Upload File)
        const formData = new FormData();
        formData.append('nim', NIM_USER);
        formData.append('nama', mahasiswa?.namaMhs || "Mahasiswa"); // Menggunakan nama dari data mahasiswa

        // Membungkus URI foto menjadi file agar dikenali oleh Java Spring
        formData.append('foto', {
            uri: uri,
            name: 'selfie.jpg',
            type: 'image/jpeg',
        });

        try {
            const response = await fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                Alert.alert("Sukses", "Foto profil tersinkronisasi ke Server!");
                fetchMahasiswa(); // Refresh data
            } else {
                Alert.alert("Error", "Gagal mengunggah foto ke server.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Terjadi kesalahan saat mengunggah foto.");
        } finally {
            setIsLoading(false);
            setIsCameraOpen(false);
        }
    };

    // 6. RENDER UI
    if (isLoading && !isCameraOpen) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0056b3" />
            </View>
        );
    }

    // 7. Handle Rendering UI Kamera
    if (isCameraOpen) {
        if (!permission) return <View style={styles.container}><Text>Memuat perizinan ...</Text></View>;
        if (!permission.granted) {
            return (
                <View style={styles.container}>
                    <Text style={styles.infoText}>Kami butuh akses kamera untuk Selfie Profil.</Text>
                    <TouchableOpacity style={styles.button} onPress={requestPermission}>
                        <Text style={styles.buttonText}>Beri Izin Kamera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonDanger} onPress={() => setIsCameraOpen(false)}>
                        <Text style={styles.buttonText}>Batal</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef}>
                    <View style={styles.cameraOverlay}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                            <Text style={styles.captureButtonText}>Ambil & Kirim</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
                            <Text style={{ color: 'white', marginBottom: 20 }}>Batal</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    }

    // 8. Handle Rendering UI Halaman About (Profil)
    return (
        <View style={styles.container}>
            <View style={styles.profileCard}>
                {/* Konversi byte[] (Blob) dari API menjadi Base64 agar tampil di <Image> */}
                <Image
                    source={mahasiswa?.fotoMhs
                        ? { uri: `data:image/jpeg;base64,${mahasiswa.fotoMhs}` }
                        // Gunakan URI gambar online sebagai Fallback jika foto kosong
                        : { uri: 'https://i.pravatar.cc/150?img=3' }
                    }
                    style={styles.profileImage}
                />

                <Text style={styles.nameText}>{mahasiswa?.namaMhs || "Mahasiswa"}</Text>
                <Text style={styles.nimText}>{NIM_USER}</Text>

                <TouchableOpacity style={styles.button} onPress={() => setIsCameraOpen(true)}>
                    <Text style={styles.buttonText}>Ganti Foto Selfie</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 9. Styling Komponen
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f4f4f9', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    profileCard: { 
        backgroundColor: 'white', 
        width: '85%', 
        padding: 30, 
        borderRadius: 20, 
        alignItems: 'center',
        elevation: 5 
    },
    profileImage: { 
        width: 150, 
        height: 150, 
        borderRadius: 75, 
        marginBottom: 20, 
        borderWidth: 2,
        borderColor: '#0056b3' 
    },
    nameText: { 
        fontSize: 20, 
        fontWeight: 'bold' 
    },
    nimText: { 
        fontSize: 16, 
        color: 'gray', 
        marginBottom: 20 
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 30
    },
    button: { 
        backgroundColor: '#0056b3', 
        padding: 12, 
        borderRadius: 10, 
        width: '100%', 
        alignItems: 'center',
        marginBottom: 10
    },
    buttonDanger: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center'
    },
    buttonText: { 
        color: 'white', 
        fontWeight: 'bold' 
    },
    cameraOverlay: { 
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center' 
    },
    captureButton: { 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 30, 
        marginBottom: 20 
    },
    captureButtonText: { 
        fontWeight: 'bold' 
    }
});
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/authContext';
import { Paciente, getPatientsByResponsible } from '../../services/patientListService';
import { predictStrabismus } from '../../services/predictionService';
import { homeStyles } from '../../styles/homeStyles';

const styles = homeStyles;

export default function HomeScreen() {
  const { userData } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      fetchPacientes();
    }
  }, [userData]);

  const fetchPacientes = async () => {
    if (!userData?.id) {
      return;
    }

    try {
      setLoading(true);
      const pacientes = await getPatientsByResponsible(userData.id);
      setPacientes(pacientes);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pacientes. Por favor verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
  };

  const handleTakePhoto = async () => {
    if (!selectedPaciente) {
      Alert.alert('Error', 'Por favor selecciona un paciente primero');
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos de cámara para continuar');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al tomar la foto. Por favor intente nuevamente.');
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos de galería para continuar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await uploadImage(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al seleccionar la foto. Por favor intente nuevamente.');
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!selectedPaciente) {
      Alert.alert('Error', 'Por favor selecciona un paciente primero');
      return;
    }
    
    setUploading(true);
    try {
      const data = await predictStrabismus(selectedPaciente.documentoIdentidad, imageUri);
      
      if (data.tieneEstrabismo) {
        Alert.alert('Estrabismo detectado', `Confianza: ${(data.confianza * 100).toFixed(2)}%`);
      } else {
        Alert.alert('No se detectó estrabismo', `Confianza: ${(data.confianza * 100).toFixed(2)}%`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la imagen');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando pacientes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Selecciona un paciente</Text>
      
      {!selectedPaciente ? (
        <View style={styles.pacientesContainer}>
          {pacientes.length > 0 ? (
            pacientes.map((paciente) => (
              <TouchableOpacity
                key={paciente.id}
                style={styles.pacienteButton}
                onPress={() => handleSelectPaciente(paciente)}
              >
                <Text style={styles.pacienteText}>
                  {paciente.nombres} {paciente.apellidos}
                </Text>
                <Text style={styles.documentoText}>
                  {paciente.documentoIdentidad}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noPacientes}>No hay pacientes registrados</Text>
          )}
        </View>
      ) : (
        <View style={styles.pacienteSeleccionado}>
          <Text style={styles.subtitle}>Paciente seleccionado:</Text>
          <Text style={styles.pacienteNombre}>
            {selectedPaciente.nombres} {selectedPaciente.apellidos}
          </Text>
          <Text style={styles.pacienteDoc}>
            Documento: {selectedPaciente.documentoIdentidad}
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, uploading && styles.buttonDisabled]} 
            onPress={handleTakePhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Tomar foto</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => setSelectedPaciente(null)}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Cambiar paciente
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleSelectPhoto}
            disabled={uploading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Subir foto
            </Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          )}
        </View>
      )}
    </ScrollView>
  );
}


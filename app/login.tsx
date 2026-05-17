import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../services/authContext";
import { loginUser } from "../services/authService";
import { loginStyles } from "../styles/loginStyles";

const styles = loginStyles;

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      if (!correo || !password) {
        Alert.alert("Error", "Por favor ingrese correo y contraseña");
        return;
      }

      const response = await loginUser(correo, password);

      if (response.error === "Bad credentials") {
        Alert.alert(
          "Error de credenciales",
          "El correo o la contraseña son incorrectos. Por favor verifica tus datos."
        );
        return;
      }

      if (response.error) {
        Alert.alert("Error", response.error || "Error en el servidor. Por favor intente nuevamente.");
        return;
      }

      if (response.token) {
        await login(response.token);
        Alert.alert("Login exitoso", "Has iniciado sesión correctamente! Si aún no tienes pacientes registrados, puedes agregarlos fácilmente desde la pestaña de 'Perfil'");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Error", "Respuesta del servidor inválida");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error durante el login. Por favor intente nuevamente.");
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#666"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity 
                    style={styles.showButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showButtonText}>
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}


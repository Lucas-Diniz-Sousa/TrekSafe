# 🗺️ TrekSafe

Um aplicativo de mapas React Native moderno e intuitivo com suporte a modo escuro automático e controles de navegação avançados.

## 📱 Sobre o App

TrekSafe é um aplicativo de mapas desenvolvido em React Native que oferece uma experiência de navegação fluida e moderna. Com integração ao Google Maps, detecção automática de localização e interface adaptativa, é perfeito para explorar e navegar por qualquer região.

## ✨ Funcionalidades

### 🗺️ **Mapa Interativo**

- Integração completa com Google Maps
- Navegação fluida com gestos touch
- Zoom por pinça e botões dedicados
- Rotação e inclinação do mapa

### 📍 **Localização**

- Detecção automática da localização do usuário
- Botão para centralizar no usuário
- Fallback para localização padrão (Belo Horizonte)
- Tratamento robusto de erros de GPS

### 🌙 **Modo Escuro Automático**

- Detecção automática do tema do sistema
- Estilo de mapa adaptativo (claro/escuro)
- Interface responsiva ao tema
- Transições suaves entre temas

### 🎮 **Controles Intuitivos**

- Botões flutuantes para zoom (+/-)
- Botão de centralização na localização
- Feedback visual nos controles
- Animações suaves

### ⚡ **Performance Otimizada**

- Cache de mapas habilitado
- Renderização eficiente
- Configurações otimizadas para Android/iOS
- Carregamento rápido

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **react-native-maps** - Integração com mapas
- **react-native-permissions** - Gerenciamento de permissões
- **@react-native-community/geolocation** - Serviços de localização
- **Google Maps API** - Provedor de mapas

## �� Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [Yarn](https://yarnpkg.com/) (gerenciador de pacotes)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (para Android)
- [Xcode](https://developer.apple.com/xcode/) (para iOS - apenas macOS)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/treksafe.git
cd treksafe
```

### 2. Instale as dependências

```bash
yarn install
```

### 3. Configuração do Google Maps

#### Android

1. Obtenha uma chave da API do Google Maps no [Google Cloud Console](https://console.cloud.google.com/)
2. Ative as seguintes APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (se usar iOS)
3. Adicione a chave no arquivo `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="SUA_CHAVE_AQUI"/>
</application>
```

#### iOS

1. Adicione a chave no arquivo `ios/TrekSafe/AppDelegate.m`:

```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"SUA_CHAVE_AQUI"];
  // resto do código...
}
```

### 4. Configuração de permissões

#### Android

As permissões já estão configuradas no `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS

Adicione no `ios/TrekSafe/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização para mostrar sua posição no mapa.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Este app precisa acessar sua localização para mostrar sua posição no mapa.</string>
```

## ��‍♂️ Executando o App

### Android

```bash
# Inicie o Metro bundler
yarn start

# Em outro terminal, execute o app
yarn android
```

### iOS

```bash
# Instale os pods (apenas na primeira vez ou após mudanças)
cd ios && pod install && cd ..

# Inicie o Metro bundler
yarn start

# Em outro terminal, execute o app
yarn ios
```

## 📁 Estrutura do Projeto

```
TrekSafe/
├── src/
│   ├── screens/
│   │   └── MapScreen/
│   │       ├── index.js          # Componente principal do mapa
│   │       └── styles.js         # Estilos do componente
│   └── App.js                    # Componente raiz
├── android/                      # Configurações Android
├── ios/                         # Configurações iOS
├── package.json                 # Dependências do projeto
├── yarn.lock                    # Lock file do Yarn
└── README.md                    # Este arquivo
```

## 🎨 Personalização

### Alterando o estilo do mapa

O estilo do modo escuro pode ser customizado no arquivo `src/screens/MapScreen/index.js` na variável `mapStyle`.

### Modificando a localização padrão

Para alterar a localização padrão (atualmente Belo Horizonte), modifique as coordenadas no arquivo `src/screens/MapScreen/index.js`:

```javascript
const defaultLocation = {
  latitude: -19.916667, // Sua latitude
  longitude: -43.933333, // Sua longitude
};
```

### Personalizando cores

As cores do tema podem ser alteradas no arquivo `src/screens/MapScreen/styles.js`.

## �� Scripts Disponíveis

```bash
# Instalar dependências
yarn install

# Iniciar o Metro bundler
yarn start

# Executar no Android
yarn android

# Executar no iOS
yarn ios

# Limpar cache do Metro
yarn start --reset-cache

# Verificar problemas de configuração
yarn react-native doctor
```

## 🐛 Solução de Problemas

### Erro de build no Android

```bash
cd android
./gradlew clean
cd ..
yarn android
```

### Erro de permissões

Certifique-se de que as permissões estão configuradas corretamente e que o usuário concedeu acesso à localização.

### Mapa não carrega

1. Verifique se a chave do Google Maps está correta
2. Confirme se as APIs necessárias estão ativadas no Google Cloud Console
3. Verifique a conexão com a internet

### Problemas com pods (iOS)

```bash
cd ios
pod deintegrate
pod install
cd ..
yarn ios
```

## 📱 Compatibilidade

- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 10.0+
- **React Native**: 0.72+

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Lucas Diniz**

- Desenvolvedor Fullstack
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## �� Agradecimentos

- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Native Community](https://github.com/react-native-community)
- [Google Maps Platform](https://developers.google.com/maps)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

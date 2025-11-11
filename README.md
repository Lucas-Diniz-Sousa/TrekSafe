# 🗺️ TrekSafe

Um aplicativo de trilhas e navegação em React Native, com mapa interativo, gravação/gestão de trilhas, POIs, exportação, autenticação e tema escuro automático.

## 📱 Sobre o App

TrekSafe oferece navegação fluida com `react-native-maps`, grava trilhas com detalhes (pontos, distância, duração), permite criar/editar POIs, exporta trilhas (GPX/JSON/TXT) e sincroniza dados via API quando autenticado. O app acompanha o tema do sistema (claro/escuro) e traz controles intuitivos para zoom, centralização e gerenciamento de trilhas.

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

### 🧭 **Gravação e Gestão de Trilhas**

- Início/pausa/finalização de gravação.
- Polilinha ao vivo no mapa com pontos.
- Edição, compartilhamento e exclusão de trilhas.
- Sincronização com a API quando autenticado.

### 🗂️ **Trilhas Públicas e Exportação**

- Listagem de trilhas públicas por área.
- Visualização de detalhes (POIs, estatísticas, trechos).
- Exportação em GPX, JSON e TXT.

### 📍 **Pontos de Interesse (POIs)**

- Criação, edição e remoção de POIs.
- Categorias e ícones específicos.
- Validação de dados e cálculo de distância.

### 🔐 **Autenticação**

- Login, registro, logout e recuperação de senha.
- Armazenamento seguro com `react-native-keychain` e `AsyncStorage`.
- Gestão de tokens de acesso/atualização.

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **react-native-maps** - Integração com mapas
- **react-native-permissions** - Gerenciamento de permissões
- **@react-native-community/geolocation** - Serviços de localização
- **Google Maps API** - Provedor de mapas
- **@react-navigation/native** e **@react-navigation/native-stack** - Navegação
- **react-native-keychain** e **@react-native-async-storage/async-storage** - Armazenamento seguro
- **axios** - Cliente HTTP

## ✅ Pré-requisitos

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

O projeto iOS está configurado sem chave do Google por padrão. Se optar por usar o provider Google no iOS (em vez do Apple Maps padrão), siga:

1. Adicione os pods no `ios/Podfile`:

```ruby
target 'TrekSafe' do
  # ... configuração existente
  pod 'GoogleMaps'
  pod 'Google-Maps-iOS-Utils'
end
```

2. Instale os pods:

```bash
cd ios && pod install && cd ..
```

3. Inicialize o SDK no `ios/TrekSafe/AppDelegate.mm`:

```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"SUA_CHAVE_AQUI"]; // substitua pela sua chave
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

Observação: se permanecer com o provider padrão (Apple), não é necessário configurar `GoogleMaps` no iOS.

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

## ▶️ Executando o App

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
│   ├── App.tsx                   # Componente raiz da aplicação
│   ├── navigation/
│   │   └── AppNavigator.js       # Controle de rotas e auth
│   ├── screens/
│   │   ├── LoginScreen/
│   │   │   ├── LoginScreen.js
│   │   │   └── LoginScreen.styles.js
│   │   └── MapScreen/
│   │       ├── MapScreen.js      # Tela principal de mapa
│   │       └── MapScreen.styles.js
│   ├── components/
│   │   ├── MapControls.js        # Controles flutuantes do mapa
│   │   ├── AddPOIModal.js        # Modal para adicionar POIs
│   │   └── TrailsModal.js        # Modal de trilhas (minhas/públicas)
│   ├── context/
│   │   └── AuthContext.js        # Contexto de autenticação
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── trailService.js
│   │   ├── poiService.js
│   │   └── favoriteService.js
│   └── theme/
│       └── theme.js
├── android/                      # Configurações Android
├── ios/                          # Configurações iOS
├── package.json                  # Dependências do projeto
├── yarn.lock                     # Lock file do Yarn
└── README.md                     # Este arquivo
```

## 🎨 Personalização

### Alterando o estilo do mapa

O estilo do mapa (claro/escuro) pode ser customizado em `src/screens/MapScreen/MapScreen.js` (variáveis de estilo do mapa) e em `src/screens/MapScreen/MapScreen.styles.js`.

### Modificando a localização padrão

Para alterar a localização padrão (atualmente Belo Horizonte), modifique as coordenadas iniciais (`initialRegion`) em `src/screens/MapScreen/MapScreen.js`:

```javascript
const defaultLocation = {
  latitude: -19.916667, // Sua latitude
  longitude: -43.933333, // Sua longitude
};
```

### Personalizando cores

As cores e tipografia do tema podem ser alteradas em `src/theme/theme.js`.

## 🧩 Scripts Disponíveis

```bash
# Instalar dependências
yarn install

# Iniciar o Metro bundler
yarn start

# Executar no Android
yarn android

# Executar no iOS
yarn ios

# Testes com Jest
yarn test

# Lint do código
yarn lint

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

### Exportação de Trilhas (GPX/JSON/TXT)

Para exportar trilhas:

- Abra o modal de Trilhas (botão na tela do mapa).
- Selecione a trilha desejada.
- Toque em “Exportar” e escolha o formato (GPX, JSON ou TXT).
- Compartilhe/salve utilizando a folha de compartilhamento do sistema.

Notas:

- Trilhas públicas podem ser visualizadas e compartilhadas; exportação pode variar conforme permissões.
- O conteúdo exportado inclui pontos do percurso e metadados básicos (nome, duração, distância), quando disponíveis.

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

## 🙏 Agradecimentos

- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [React Native Community](https://github.com/react-native-community)
- [Google Maps Platform](https://developers.google.com/maps)

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

// src/theme/theme.js

export const Colors = {
  // ========== CORES PRIMÁRIAS (TrekSafe) ==========
  verdeFlorestaProfundo: '#1C3D2B', // Cor Principal da Marca
  douradoNobre: '#A68D5D', // Accent Principal

  // ========== CORES SECUNDÁRIAS (TrekSafe) ==========
  verdeMusgo: '#3C6E53',
  azulCascata: '#6BA8B4',
  marromRustico: '#6C5543',
  cremeClaro: '#F8F5EE',

  // ========== CORES BÁSICAS ==========
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ========== TONS DE CINZA ==========
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // ========== CORES DE STATUS ==========
  // Sucesso (Verde)
  successGreen: '#38A169',
  successLight: '#68D391',
  successDark: '#2F855A',
  
  // Erro/Perigo (Vermelho)
  errorRed: '#E53E3E',
  errorLight: '#FC8181',
  errorDark: '#C53030',
  cancelRed: '#E53E3E', // Alias para errorRed
  
  // Aviso (Laranja/Amarelo)
  warningOrange: '#DD6B20',
  warningLight: '#F6AD55',
  warningDark: '#C05621',
  warningYellow: '#D69E2E',
  
  // Informação (Azul)
  infoBlue: '#3182CE',
  infoLight: '#63B3ED',
  infoDark: '#2C5282',

  // ========== CORES COMPLEMENTARES ==========
  // Azuis
  blue50: '#EBF8FF',
  blue100: '#BEE3F8',
  blue200: '#90CDF4',
  blue300: '#63B3ED',
  blue400: '#4299E1',
  blue500: '#3182CE',
  blue600: '#2B77CB',
  blue700: '#2C5282',
  blue800: '#2A4365',
  blue900: '#1A365D',

  // Verdes
  green50: '#F0FFF4',
  green100: '#C6F6D5',
  green200: '#9AE6B4',
  green300: '#68D391',
  green400: '#48BB78',
  green500: '#38A169',
  green600: '#2F855A',
  green700: '#276749',
  green800: '#22543D',
  green900: '#1C4532',

  // Vermelhos
  red50: '#FED7D7',
  red100: '#FEB2B2',
  red200: '#FC8181',
  red300: '#F56565',
  red400: '#E53E3E',
  red500: '#C53030',
  red600: '#9B2C2C',
  red700: '#822727',
  red800: '#63171B',
  red900: '#1A202C',

  // Laranjas
  orange50: '#FFFAF0',
  orange100: '#FEEBC8',
  orange200: '#FBD38D',
  orange300: '#F6AD55',
  orange400: '#ED8936',
  orange500: '#DD6B20',
  orange600: '#C05621',
  orange700: '#9C4221',
  orange800: '#7B341E',
  orange900: '#652B19',

  // Amarelos
  yellow50: '#FFFFF0',
  yellow100: '#FEFCBF',
  yellow200: '#FAF089',
  yellow300: '#F6E05E',
  yellow400: '#ECC94B',
  yellow500: '#D69E2E',
  yellow600: '#B7791F',
  yellow700: '#975A16',
  yellow800: '#744210',
  yellow900: '#5F370E',

  // Roxos
  purple50: '#FAF5FF',
  purple100: '#E9D8FD',
  purple200: '#D6BCFA',
  purple300: '#B794F6',
  purple400: '#9F7AEA',
  purple500: '#805AD5',
  purple600: '#6B46C1',
  purple700: '#553C9A',
  purple800: '#44337A',
  purple900: '#322659',

  // Rosas
  pink50: '#FFF5F7',
  pink100: '#FED7E2',
  pink200: '#FBB6CE',
  pink300: '#F687B3',
  pink400: '#ED64A6',
  pink500: '#D53F8C',
  pink600: '#B83280',
  pink700: '#97266D',
  pink800: '#702459',
  pink900: '#521B41',

  // ========== CORES ESPECÍFICAS DO APP ==========
  // Navegação
  tabBarActive: '#1C3D2B',
  tabBarInactive: '#9CA3AF',
  tabBarBackground: '#FFFFFF',
  tabBarBackgroundDark: '#1F2937',

  // Botões
  primaryButton: '#1C3D2B',
  primaryButtonHover: '#2F5A3F',
  secondaryButton: '#A68D5D',
  secondaryButtonHover: '#8A7350',
  disabledButton: '#D1D5DB',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundDark: '#374151',
  inputBorder: '#D1D5DB',
  inputBorderFocus: '#3182CE',
  inputBorderError: '#E53E3E',
  inputText: '#1F2937',
  inputTextDark: '#F9FAFB',
  inputPlaceholder: '#9CA3AF',

  // Cards e Containers
  cardBackground: '#FFFFFF',
  cardBackgroundDark: '#1F2937',
  cardBorder: '#E5E7EB',
  cardBorderDark: '#374151',
  cardShadow: 'rgba(0, 0, 0, 0.1)',

  // Overlays e Modais
  overlayBackground: 'rgba(0, 0, 0, 0.5)',
  overlayBackgroundLight: 'rgba(0, 0, 0, 0.3)',
  modalBackground: '#FFFFFF',
  modalBackgroundDark: '#1F2937',

  // ========== CORES DO MAPA ==========
  mapLightBase: '#F0EFEA',
  mapDarkBase: '#1A1A1A',
  mapRoadLight: '#CDCDCD',
  mapRoadDark: '#404040',
  mapWaterLight: '#BDDAE3',
  mapWaterDark: '#1F374A',
  mapLandmarkLight: '#E6E6E6',
  mapLandmarkDark: '#333333',
  mapTextLight: '#616161',
  mapTextDark: '#AAAAAA',

  // Trilhas e Marcadores
  trailActive: '#A68D5D', // Trilha sendo gravada
  trailSaved: '#3C6E53',  // Trilhas salvas
  markerUser: '#6BA8B4',  // Marcador do usuário
  markerPOI: '#1C3D2B',   // Pontos de interesse

  // ========== CORES DE TEXTO ==========
  textPrimary: '#1F2937',
  textPrimaryDark: '#F9FAFB',
  textSecondary: '#6B7280',
  textSecondaryDark: '#D1D5DB',
  textMuted: '#9CA3AF',
  textMutedDark: '#6B7280',
  textLink: '#3182CE',
  textLinkHover: '#2C5282',

  // ========== CORES DE FUNDO ==========
  backgroundPrimary: '#FFFFFF',
  backgroundPrimaryDark: '#111827',
  backgroundSecondary: '#F9FAFB',
  backgroundSecondaryDark: '#1F2937',
  backgroundTertiary: '#F3F4F6',
  backgroundTertiaryDark: '#374151',

  // ========== CORES DE BORDA ==========
  borderLight: '#E5E7EB',
  borderMedium: '#D1D5DB',
  borderDark: '#9CA3AF',
  borderFocus: '#3182CE',
  borderError: '#E53E3E',
  borderSuccess: '#38A169',

  // ========== CORES ESPECIAIS ==========
  // Gradientes (para usar com LinearGradient)
  gradientStart: '#1C3D2B',
  gradientEnd: '#3C6E53',
  gradientAccentStart: '#A68D5D',
  gradientAccentEnd: '#8A7350',

  // Sombras
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
  shadowColored: 'rgba(28, 61, 43, 0.2)',

  // Estados de interação
  hoverOverlay: 'rgba(0, 0, 0, 0.05)',
  pressedOverlay: 'rgba(0, 0, 0, 0.1)',
  focusOverlay: 'rgba(49, 130, 206, 0.1)',

  // ========== ALIASES PARA COMPATIBILIDADE ==========
  errorDark: '#C53030', // Mantido para compatibilidade
};

export const Fonts = {
  // Oswald (Títulos e Headers)
  oswaldLight: 'Oswald-Light',
  oswaldRegular: 'Oswald-Regular',
  oswaldMedium: 'Oswald-Medium',
  oswaldSemiBold: 'Oswald-SemiBold',
  oswaldBold: 'Oswald-Bold',
  oswaldExtraBold: 'Oswald-ExtraBold',

  // Montserrat (Corpo do texto)
  montserratThin: 'Montserrat-Thin',
  montserratExtraLight: 'Montserrat-ExtraLight',
  montserratLight: 'Montserrat-Light',
  montserratRegular: 'Montserrat-Regular',
  montserratMedium: 'Montserrat-Medium',
  montserratSemiBold: 'Montserrat-SemiBold',
  montserratBold: 'Montserrat-Bold',
  montserratExtraBold: 'Montserrat-ExtraBold',
  montserratBlack: 'Montserrat-Black',

  // Lato (Texto secundário)
  latoThin: 'Lato-Thin',
  latoLight: 'Lato-Light',
  latoRegular: 'Lato-Regular',
  latoBold: 'Lato-Bold',
  latoBlack: 'Lato-Black',

  // Aliases para facilitar o uso
  heading: 'Oswald-Bold',
  subheading: 'Oswald-Medium',
  body: 'Montserrat-Regular',
  bodyBold: 'Montserrat-SemiBold',
  caption: 'Lato-Regular',
  button: 'Montserrat-SemiBold',
};

// ========== UTILITÁRIOS DE COR ==========
export const ColorUtils = {
  // Função para adicionar opacidade a uma cor
  withOpacity: (color, opacity) => {
    if (color.includes('rgba')) return color;
    if (color.includes('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    // Para cores hex
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return color + alpha;
  },

  // Função para obter cor baseada no tema
  getThemeColor: (lightColor, darkColor, isDark) => {
    return isDark ? darkColor : lightColor;
  },
};
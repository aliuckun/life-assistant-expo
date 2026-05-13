/**
 * Life Assistant – Merkezi Stil Dosyası
 * ======================================
 * Tüm ekranlarda ortak kullanılan stiller burada tanımlanmıştır.
 * Sayfaya özel stiller ilgili bölümde yorum satırıyla belirtilmiştir.
 *
 * Responsive tasarım için Dimensions API kullanılmaktadır.
 */

import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Responsive yardımcı fonksiyonlar ───────────────────────────────────────
/** 375px baz alınarak oransal yatay ölçekleme */
export const rs = (size: number) => Math.round((size * SCREEN_WIDTH) / 375);

/** Breakpoint: geniş ekran mı? (tablet / büyük telefon) */
export const isWide = SCREEN_WIDTH >= 428;

// ─── Renk paleti ─────────────────────────────────────────────────────────────
export const Colors = {
  // Uygulama geneli arka planlar
  background: '#F5F7FA',
  surface: '#ffffff',

  // Metin renkleri
  textPrimary: '#222222',
  textSecondary: '#333333',
  textMuted: '#888888',
  textLight: '#aaaaaa',
  textFaint: '#cccccc',

  // Marka / vurgu
  primary: '#007AFF',

  // Anlamsal renkler
  success: '#43A047',
  danger: '#E53935',
  warning: '#FF6D00',

  // Sınır / ayırıcı
  border: '#eeeeee',
  divider: '#f0f0f0',
  separator: '#F5F5F5',

  // Gölge (platforma göre opacity ile kullanılır)
  shadow: '#000000',
} as const;

// ─── Tipografi ────────────────────────────────────────────────────────────────
export const Typography = {
  screenTitle: {
    fontSize: rs(isWide ? 30 : 26),
    fontWeight: 'bold' as const,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: rs(17),
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  body: {
    fontSize: rs(14),
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: rs(12),
    color: Colors.textLight,
  },
  label: {
    fontSize: rs(11),
    color: Colors.textLight,
  },
} as const;

// ─── Ortak StyleSheet ─────────────────────────────────────────────────────────
const AppStyles = StyleSheet.create({

  // ── Layout ──────────────────────────────────────────────────────────────────
  /** Her ekranın kök view'ı */
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /** SafeAreaView içindeki kaydırmalı alanlar için padding */
  scroll: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(100),
    paddingTop: rs(16),
  },

  // ── Header (Alışkanlıklar, Harcamalar, Planlayıcı ekranlarında ortak) ──────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingTop: rs(14),
    paddingBottom: rs(10),
  },
  headerTitle: {
    fontSize: rs(isWide ? 30 : 26),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerDate: {
    fontSize: rs(13),
    color: Colors.textLight,
    marginTop: 1,
  },

  /** Ekle (+) butonu – header'ın sağına yerleştirilir */
  addBtn: {
    backgroundColor: Colors.primary,
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Section (bölüm başlığı + içerik grubu) ──────────────────────────────────
  section: {
    marginBottom: rs(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(10),
  },
  sectionTitle: {
    fontSize: rs(17),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sectionMeta: {
    fontSize: rs(12),
    color: Colors.textLight,
  },

  // ── Kart ────────────────────────────────────────────────────────────────────
  /** Standart beyaz kart */
  card: {
    backgroundColor: Colors.surface,
    borderRadius: rs(16),
    padding: rs(16),
    shadowColor: Colors.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  // ── Boş durum (empty state) ──────────────────────────────────────────────────
  /** Tüm ekranlarda kullanılan "veri yok" kartı */
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: rs(16),
    padding: rs(24),
    alignItems: 'center',
    gap: rs(8),
    shadowColor: Colors.shadow,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: rs(13),
    color: Colors.textFaint,
  },

  /** Liste ekranlarındaki büyük boş durum (ikon + başlık + alt metin) */
  emptyContainer: {
    alignItems: 'center',
    marginTop: rs(60),
  },
  emptyTitle: {
    fontSize: rs(17),
    fontWeight: '600',
    color: Colors.textFaint,
    marginTop: rs(14),
  },
  emptySub: {
    fontSize: rs(13),
    color: Colors.textLight,
    marginTop: rs(8),
    textAlign: 'center',
    lineHeight: rs(20),
  },

  // ── Özet / istatistik barı (Alışkanlıklar & Harcamalar'da ortak) ─────────────
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: rs(20),
    borderRadius: rs(16),
    paddingVertical: rs(12),
    marginBottom: rs(10),
    shadowColor: Colors.shadow,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  summaryNum: {
    fontSize: rs(22),
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  summaryLabel: {
    fontSize: rs(11),
    color: Colors.textLight,
    marginTop: rs(2),
  },

  // ── FlatList / SectionList ortak içerik padding'i ──────────────────────────
  list: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(100),
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // HOME EKRANINA ÖZEL STİLLER
  // ─────────────────────────────────────────────────────────────────────────────

  /** Karşılama bloğu */
  greetingBlock: {
    marginBottom: rs(20),
  },
  dateText: {
    fontSize: rs(13),
    color: Colors.textLight,
    marginBottom: rs(4),
  },
  greetingText: {
    fontSize: rs(isWide ? 32 : 28),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: rs(8),
  },
  motivationText: {
    fontSize: rs(14),
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: rs(20),
  },

  /** Streak (seri) kartı */
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: rs(16),
    padding: rs(14),
    marginBottom: rs(20),
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  streakEmoji: {
    fontSize: rs(28),
    marginRight: rs(12),
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#E65100',
  },
  streakSub: {
    fontSize: rs(12),
    color: '#BF360C',
    marginTop: rs(2),
  },
  streakCount: {
    fontSize: rs(32),
    fontWeight: 'bold',
    color: Colors.warning,
  },

  /** İlerleme çubuğu satırı (Home > görev kartı içi) */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginBottom: rs(14),
  },
  progressBg: {
    flex: 1,
    height: rs(6),
    backgroundColor: Colors.divider,
    borderRadius: rs(3),
  },
  progressFill: {
    height: rs(6),
    backgroundColor: Colors.primary,
    borderRadius: rs(3),
  },
  progressPct: {
    fontSize: rs(12),
    fontWeight: '600',
    color: Colors.primary,
    minWidth: rs(34),
    textAlign: 'right',
  },

  /** Görev satırı (Home özet kartı içi) */
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(9),
    gap: rs(10),
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  taskDot: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(5),
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDotDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskTitle: {
    flex: 1,
    fontSize: rs(14),
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  taskTitleDone: {
    color: Colors.textFaint,
    textDecorationLine: 'line-through',
  },
  taskTime: {
    fontSize: rs(11),
    color: Colors.textLight,
  },
  moreText: {
    fontSize: rs(12),
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: rs(10),
  },

  /** Alışkanlık chip'leri (Home özet içi) */
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(8),
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    backgroundColor: Colors.surface,
    borderRadius: rs(20),
    borderWidth: 1.5,
    borderColor: Colors.border,
    maxWidth: '48%',
  },
  habitChipDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  habitChipOver: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  habitChipText: {
    fontSize: rs(12),
    fontWeight: '500',
    color: '#555555',
    flexShrink: 1,
  },
  habitChipTextDone: {
    color: Colors.surface,
  },

  /** Alt istatistik kartları (Home ekranı alt kısmı) */
  statsRow: {
    flexDirection: 'row',
    gap: rs(10),
    marginBottom: rs(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: rs(14),
    paddingVertical: rs(14),
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: rs(22),
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  statLabel: {
    fontSize: rs(11),
    color: Colors.textLight,
    marginTop: rs(3),
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PLANNER EKRANINA ÖZEL STİLLER
  // ─────────────────────────────────────────────────────────────────────────────

  /** Lottie konfeti katmanı – ekranın tamamını kaplar, etkileşimi engeller */
  lottieContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },

  /** Planner header – addBtn yerine addButton ismi kullanılır (Ionicons uyumu) */
  plannerAddButton: {
    backgroundColor: Colors.primary,
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPENSES EKRANINA ÖZEL STİLLER
  // ─────────────────────────────────────────────────────────────────────────────

  /** Net bakiye kartı */
  balanceCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: rs(20),
    borderRadius: rs(20),
    padding: rs(20),
    marginBottom: rs(14),
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  balanceMain: {
    alignItems: 'center',
    marginBottom: rs(16),
  },
  balanceLabel: {
    fontSize: rs(12),
    color: Colors.textLight,
    marginBottom: rs(4),
  },
  balanceAmount: {
    fontSize: rs(isWide ? 36 : 32),
    fontWeight: 'bold',
  },
  balanceSub: {
    flexDirection: 'row',
  },
  balanceSubItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceSubDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  balanceSubLabel: {
    fontSize: rs(11),
    color: Colors.textLight,
    marginBottom: rs(3),
  },
  balanceSubValue: {
    fontSize: rs(14),
    fontWeight: '600',
  },

  /** Tab seçici (Liste / Özet) */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: rs(12),
    marginHorizontal: rs(20),
    marginBottom: rs(14),
    padding: rs(3),
  },
  tabBtn: {
    flex: 1,
    paddingVertical: rs(8),
    borderRadius: rs(10),
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.surface,
  },
  tabBtnText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabBtnTextActive: {
    color: Colors.textSecondary,
  },

  /** Gün başlığı (SectionList header'ı) */
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: rs(16),
    marginBottom: rs(8),
  },
  dayLabel: {
    fontSize: rs(13),
    fontWeight: '700',
    color: '#555555',
  },
  dayTotal: {
    fontSize: rs(12),
    fontWeight: '600',
  },

  /** İşlem satırı wrapper'ı */
  txWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: rs(14),
    paddingHorizontal: rs(14),
    marginBottom: rs(2),
  },
  separator: {
    height: 1,
    backgroundColor: Colors.separator,
  },

  /** Kategori yönetim bölümü */
  catSection: {
    backgroundColor: Colors.surface,
    borderRadius: rs(16),
    padding: rs(16),
    marginBottom: rs(16),
  },
  catSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(12),
  },
  catSectionTitle: {
    fontSize: rs(15),
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catAddBtn: {
    fontSize: rs(13),
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCat: {
    fontSize: rs(13),
    color: Colors.textFaint,
    textAlign: 'center',
    paddingVertical: rs(12),
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(10),
    gap: rs(12),
  },
  catIcon: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    flex: 1,
    fontSize: rs(14),
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GOALS EKRANINA ÖZEL STİLLER
  // ─────────────────────────────────────────────────────────────────────────────

  /** Goals scroll içeriği */
  goalsScrollContent: {
    paddingBottom: rs(40),
  },

  /** Loading ekranı merkez */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default AppStyles;

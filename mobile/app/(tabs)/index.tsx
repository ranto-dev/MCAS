import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.0.104:8080/predict';
const AMBULANCE_URL = 'http://192.168.0.104:8080/ambulances';

interface Etablissement {
  nom: string;
  region: string;
  contact: string;
  categorie: string;
}

interface AmbulanceData {
  ID: number;
  refference: string;
  status: string;
}

interface DiagnosisResponse {
  maladie: string;
  urgence: string;
  etablissement: Etablissement[];
  ambulances: AmbulanceData[];
}

type AppView = 'landing' | 'symptoms' | 'results';
type RequestStatus = 'idle' | 'sent' | 'waiting';

const SYMPTOMS = [
  'Tazo',
  'Aretin-doha',
  'Mangidihidy',
  'Mikohaka',
  'Fanaintainana an-kibo',
  'Maloiloy',
  'Mandoa',
  'Marary tratra',
  'Sahirana miaina',
  'Fivalanana',
  'Fanaintainana amin ny hozatra',
  'Mivonto tongotra',
  'Torana',
  'Misy ra mandeha',
  'Mangovitra',
  'Miketrika',
  'Tsy mihinana',
  'Tsy mahita torimaso',
  'Aretin tenda',
  'Maimbo orona',
];

function PillButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.symptomCard, selected && styles.symptomCardSelected]}>
      <Text style={[styles.symptomText, selected && styles.symptomTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [locationName] = useState('Antsirabe');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 380;
  const horizontalPadding = isSmallPhone ? 12 : 18;

  const pulse = useRef(new Animated.Value(1)).current;
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [appear, currentView]);

  const allSymptoms = useMemo(
    () =>
      Array.from(new Set(SYMPTOMS))
        .map((item) => item.trim())
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <View style={[styles.locationPill, { marginHorizontal: horizontalPadding }]}>
        <Ionicons name="location" size={16} color="#ef4444" />
        <Text style={styles.locationText}>Ianao dia eto: {locationName}</Text>
      </View>

      {currentView === 'landing' && (
        <Animated.View
          style={[
            styles.centered,
            { paddingHorizontal: horizontalPadding, opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
          ]}>
          <Animated.View style={[styles.heartWrap, { transform: [{ scale: pulse }] }]}>
            <Ionicons name="heart" size={56} color="#dc2626" />
          </Animated.View>
          <View style={styles.illustrationRow}>
            <View style={styles.illustrationBadge}>
              <MaterialCommunityIcons name="hospital-box-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.illustrationBadge}>
              <Ionicons name="medkit-outline" size={20} color="#0ea5e9" />
            </View>
            <View style={styles.illustrationBadge}>
              <MaterialCommunityIcons name="ambulance" size={20} color="#16a34a" />
            </View>
          </View>
          <Text style={styles.title}>MADA-CARE AI</Text>
          <Text style={styles.subtitle}>
            Fitaovana hifidianana toeram-pitsaboana mifanaraka amin ny aretinao.
          </Text>
          <Pressable onPress={() => setCurrentView('symptoms')} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Hanomboka</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {currentView === 'symptoms' && (
        <SymptomsPage
          allSymptoms={allSymptoms}
          selectedSymptoms={selectedSymptoms}
          setSelectedSymptoms={setSelectedSymptoms}
          horizontalPadding={horizontalPadding}
          onBack={() => setCurrentView('landing')}
          onContinue={() => setCurrentView('results')}
        />
      )}

      {currentView === 'results' && (
        <TriageResultsPage
          locationName={locationName}
          selectedSymptoms={selectedSymptoms}
          horizontalPadding={horizontalPadding}
          onBack={() => {
            setSelectedSymptoms([]);
            setCurrentView('symptoms');
          }}
        />
      )}
    </SafeAreaView>
  );
}

function SymptomsPage({
  allSymptoms,
  selectedSymptoms,
  setSelectedSymptoms,
  horizontalPadding,
  onBack,
  onContinue,
}: {
  allSymptoms: string[];
  selectedSymptoms: string[];
  setSelectedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
  horizontalPadding: number;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const appear = useRef(new Animated.Value(0)).current;
  const itemsPerPage = 8;

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [appear]);

  const filtered = allSymptoms.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  return (
    <Animated.ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      style={{ opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(1);
          }}
          placeholder="Inona no tsapanao?"
          placeholderTextColor="#94a3b8"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Soritr aretina</Text>
        <View style={styles.symptomsGrid}>
          {currentItems.map((symptom) => (
            <PillButton
              key={symptom}
              label={symptom}
              selected={selectedSymptoms.includes(symptom)}
              onPress={() => toggleSymptom(symptom)}
            />
          ))}
        </View>

        <View style={styles.paginationRow}>
          <Pressable
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}>
            <Ionicons name="chevron-back" size={20} color="#0f172a" />
          </Pressable>
          <Text style={styles.pageText}>
            Pejy {currentPage} / {totalPages}
          </Text>
          <Pressable
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}>
            <Ionicons name="chevron-forward" size={20} color="#0f172a" />
          </Pressable>
        </View>
      </View>

      <View style={styles.selectedCard}>
        <Text style={styles.selectedTitle}>Voafidy ({selectedSymptoms.length})</Text>
        {selectedSymptoms.length === 0 ? (
          <View style={styles.emptyStateWrap}>
            <Ionicons name="sparkles-outline" size={18} color="#94a3b8" />
            <Text style={styles.emptyText}>Mbola tsy misy soritr aretina voafidy.</Text>
          </View>
        ) : (
          selectedSymptoms.map((item) => (
            <View key={item} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{item}</Text>
              <Pressable onPress={() => toggleSymptom(item)}>
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </Pressable>
            </View>
          ))
        )}

        {selectedSymptoms.length > 0 && (
          <Pressable onPress={onContinue} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Hijery ny vokatra</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </Pressable>
        )}
        <Pressable onPress={onBack} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Hiverina</Text>
        </Pressable>
      </View>
    </Animated.ScrollView>
  );
}

function TriageResultsPage({
  selectedSymptoms,
  locationName,
  horizontalPadding,
  onBack,
}: {
  selectedSymptoms: string[];
  locationName: string;
  horizontalPadding: number;
  onBack: () => void;
}) {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (selectedSymptoms.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const evidence = selectedSymptoms.reduce<Record<string, number>>((acc, symptom) => {
          acc[symptom] = 1;
          return acc;
        }, {});

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evidence,
            region: locationName.toLowerCase(),
          }),
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const data: DiagnosisResponse = await response.json();
        setDiagnosis(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [selectedSymptoms, locationName]);

  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [appear]);

  const hasFreeAmbulance = diagnosis?.ambulances?.some((item) => item.status === 'libre') ?? false;
  const isCritical = diagnosis?.urgence === 'critique' || diagnosis?.urgence === 'urgent';

  const handleAmbulanceRequest = async () => {
    if (!diagnosis?.ambulances) {
      return;
    }

    const freeAmbulance = diagnosis.ambulances.find((item) => item.status === 'libre');
    if (!freeAmbulance) {
      setRequestStatus('waiting');
      return;
    }

    try {
      const response = await fetch(`${AMBULANCE_URL}/${freeAmbulance.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "en file d'attente" }),
      });

      setRequestStatus(response.ok ? 'sent' : 'waiting');
    } catch {
      setRequestStatus('waiting');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Fandinihana ny valiny...</Text>
      </View>
    );
  }

  if (error || !diagnosis) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={52} color="#ef4444" />
        <Text style={styles.errorTitle}>Tsy nandeha ny fikarohana</Text>
        <Pressable onPress={onBack} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Hiverina</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      style={{ opacity: appear, transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
      <View style={[styles.resultHeader, isCritical ? styles.criticalHeader : styles.normalHeader]}>
        <Ionicons name="pulse" size={34} color={isCritical ? '#fff' : '#2563eb'} />
        <Text style={[styles.diseaseText, isCritical && styles.whiteText]}>{diagnosis.maladie}</Text>
        <Text style={[styles.urgencyPill, isCritical && styles.urgencyPillCritical]}>
          Ambaratonga: {diagnosis.urgence}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="hospital-building" size={20} color="#1e3a8a" />
          <Text style={styles.cardTitle}>Hopitaly soso-kevitra</Text>
        </View>

        {diagnosis.etablissement?.length ? (
          diagnosis.etablissement.map((item, index) => (
            <View key={`${item.nom}-${index}`} style={styles.hospitalItem}>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{item.nom}</Text>
                <Text style={styles.hospitalMeta}>
                  {item.categorie} • {item.region}
                </Text>
                <Text style={styles.hospitalPhone}>{item.contact}</Text>
              </View>
              <Pressable
                style={styles.callBtn}
                onPress={async () => {
                  const telUrl = `tel:${item.contact}`;
                  const canOpen = await Linking.canOpenURL(telUrl);
                  if (!canOpen) {
                    Alert.alert('Appel impossible', 'Le numero est invalide sur cet appareil.');
                    return;
                  }
                  await Linking.openURL(telUrl);
                }}>
                <Ionicons name="call" size={16} color="#2563eb" />
                <Text style={styles.callBtnText}>Antsoy</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tsy misy hopitaly hita.</Text>
        )}
      </View>

      <View style={styles.sosCard}>
        <View style={styles.sosTop}>
          <View style={[styles.sosIconWrap, requestStatus === 'sent' && styles.sosIconSent]}>
            <Ionicons
              name={requestStatus === 'sent' ? 'checkmark-circle' : 'car-sport'}
              size={28}
              color="#fff"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>
              {requestStatus === 'idle' && (hasFreeAmbulance ? 'Mila vonjy taitra haingana?' : 'Tsy misy fiara malalaka')}
              {requestStatus === 'sent' && 'Ambulance en route!'}
              {requestStatus === 'waiting' && 'Ao anaty filaharana'}
            </Text>
            <Text style={styles.sosSubtitle}>
              {requestStatus === 'idle' &&
                (hasFreeAmbulance
                  ? 'Tsindrio ny bokotra raha hangataka fiara'
                  : 'Miandrasa kely azafady...')}
              {requestStatus === 'sent' && 'Efa mivoaka ny fiara haka anao izao'}
              {requestStatus === 'waiting' && 'Nampidirina ao anaty lisitra ianao'}
            </Text>
          </View>
        </View>

        {requestStatus === 'idle' ? (
          <Pressable
            disabled={!hasFreeAmbulance}
            onPress={handleAmbulanceRequest}
            style={[styles.sosButton, !hasFreeAmbulance && styles.sosButtonDisabled]}>
            <Text style={styles.sosButtonText}>Hampiantso fiara</Text>
          </Pressable>
        ) : (
          <View style={styles.requestBadge}>
            <Text style={styles.requestBadgeText}>
              {requestStatus === 'sent' ? 'Voaray ny fangatahana' : 'Ao anaty filaharana'}
            </Text>
          </View>
        )}
      </View>

      <Pressable onPress={onBack} style={styles.secondaryBtn}>
        <Text style={styles.secondaryBtnText}>Hiverina am-piandohana</Text>
      </Pressable>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  locationPill: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heartWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#fee2e2',
    elevation: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    color: '#0f172a',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  illustrationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  illustrationBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 12,
  },
  searchRow: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    color: '#1e3a8a',
    fontWeight: '800',
    fontSize: 17,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomCard: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: '47%',
  },
  symptomCardSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  symptomText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  symptomTextSelected: {
    color: '#fff',
  },
  paginationRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 8,
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 12,
  },
  selectedCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyStateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedTitle: {
    fontWeight: '800',
    fontSize: 15,
    color: '#0f172a',
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectedItemText: {
    flex: 1,
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryBtn: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#64748b',
    fontWeight: '700',
  },
  errorTitle: {
    marginTop: 10,
    marginBottom: 20,
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 20,
  },
  resultHeader: {
    borderRadius: 20,
    padding: 18,
    gap: 8,
    borderWidth: 1,
  },
  criticalHeader: {
    backgroundColor: '#dc2626',
    borderColor: '#f87171',
  },
  normalHeader: {
    backgroundColor: '#fff',
    borderColor: '#dbeafe',
  },
  diseaseText: {
    fontSize: 24,
    color: '#0f172a',
    fontWeight: '800',
  },
  whiteText: {
    color: '#fff',
  },
  urgencyPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  urgencyPillCritical: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hospitalItem: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  hospitalInfo: {
    flex: 1,
    gap: 2,
  },
  hospitalName: {
    color: '#1e3a8a',
    fontWeight: '800',
    fontSize: 16,
  },
  hospitalMeta: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  hospitalPhone: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  callBtn: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  callBtnText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
  sosCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 14,
    gap: 12,
  },
  sosTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sosIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosIconSent: {
    backgroundColor: '#16a34a',
  },
  sosTitle: {
    color: '#7f1d1d',
    fontWeight: '800',
    fontSize: 14,
  },
  sosSubtitle: {
    marginTop: 2,
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  sosButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  requestBadge: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBadgeText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    fontSize: 13,
  },
});

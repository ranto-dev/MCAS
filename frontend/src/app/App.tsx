import { useState, useEffect } from "react";
import {
  Activity,
  Ambulance,
  Heart,
  MapPin,
  Clock,
  Search,
  ChevronRight,
} from "lucide-react";

// --- COMPOSANT PRINCIPAL ---
export default function App() {
  const [currentView, setCurrentView] = useState<
    "landing" | "symptoms" | "results"
  >("landing");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [locationName, setLocationName] = useState<string>(
    "Mikaroka toerana...",
  );

  // Récupération de la position en temps réel (Reverse Geocoding)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            );
            const data = await res.json();
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "Madagasikara";
            const suburb =
              data.address.suburb || data.address.neighbourhood || "";
            setLocationName(`${city}${suburb ? ", " + suburb : ""}`);
          } catch (e) {
            setLocationName("Antsirabe, Vatofotsy"); // Fallback si l'API échoue
          }
        },
        () => setLocationName("Antsirabe, Vatofotsy"), // Fallback si l'utilisateur refuse
        { enableHighAccuracy: true },
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-slate-900 font-sans">
      {/* Widget Localisation en haut à gauche */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-blue-100 transition-all hover:scale-105">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <MapPin className="w-4 h-4 text-red-500" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-400 uppercase leading-none">
            Toerana misy anao
          </span>
          <span className="text-xs font-bold text-blue-700 leading-tight">
            {locationName}
          </span>
        </div>
      </div>

      {/* Rendu des Vues */}
      {currentView === "landing" && (
        <LandingPage onStart={() => setCurrentView("symptoms")} />
      )}

      {currentView === "symptoms" && (
        <SymptomsPage
          selectedSymptoms={selectedSymptoms}
          setSelectedSymptoms={setSelectedSymptoms}
          onBack={() => setCurrentView("landing")}
          onContinue={() => setCurrentView("results")}
        />
      )}

      {currentView === "results" && (
        <TriageResultsPage
          symptoms={selectedSymptoms}
          onBack={() => setCurrentView("symptoms")}
        />
      )}
    </div>
  );
}

// --- COMPOSANT : LANDING PAGE ---
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white p-6 rounded-full shadow-2xl mb-8 border-4 border-red-50">
        <Heart className="w-16 h-16 text-red-600 animate-pulse" />
      </div>
      <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
        MADA-CARE <span className="text-blue-600">AI</span>
      </h1>
      <p className="max-w-xl text-xl text-gray-600 mb-10 leading-relaxed">
        Vahaolana manan-tsaina hanampiana anao amin'ny fahasalamanao. Tombano ny
        soritr'aretinao ary mahazo torolalana malaka avy hatrany.
      </p>

      <button
        onClick={onStart}
        className="group relative bg-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl flex items-center gap-4 overflow-hidden"
      >
        <span className="relative z-10">Hamantatra ny soritr'aretina</span>
        <ChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>

      <div className="mt-12 flex gap-8 text-gray-400 font-medium uppercase text-xs tracking-widest">
        <span>24/7 Misy foana</span>
        <span>•</span>
        <span>Haingana</span>
        <span>•</span>
        <span>Azo antoka</span>
      </div>
    </div>
  );
}

// --- COMPOSANT : SYMPTOMS PAGE ---
function SymptomsPage({
  selectedSymptoms,
  setSelectedSymptoms,
  onBack,
  onContinue,
}: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(
        selectedSymptoms.filter((s: string) => s !== symptom),
      );
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const symptomCategories = [
    {
      id: "general",
      name: "Ankapobeny",
      icon: "🌡️",
      color: "red",
      symptoms: [
        "Tazo / Mafana ny vatana",
        "Mangatsiaka",
        "Reraka be",
        "Very lanja",
      ],
    },
    {
      id: "respiratory",
      name: "Pisefoana",
      icon: "🫁",
      color: "blue",
      symptoms: [
        "Kohaka",
        "Safotra",
        "Mitsoka rà",
        "Manahirana ny fisefoana",
        "Tsindria ny tratra",
      ],
    },
    {
      id: "digestive",
      name: "Kibo sy Fandevonana",
      icon: "🫃",
      color: "green",
      symptoms: [
        "Marary kibo",
        "Aretim-pivalanana",
        "Maloiloy / Mandoa",
        "Mivonto kibo",
      ],
    },
    {
      id: "neurological",
      name: "Atidoha sy Hozatra",
      icon: "🧠",
      color: "purple",
      symptoms: [
        "Marary loha",
        "Mivaingana ny vatana",
        "Ratsy fahitana",
        "Fanina",
      ],
    },
  ];

  const filteredCategories = symptomCategories
    .map((cat) => ({
      ...cat,
      symptoms: cat.symptoms.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.symptoms.length > 0);

  return (
    <div className="min-h-screen pt-20">
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all text-sm font-bold"
        >
          ← Hiverina
        </button>
        <h1 className="text-lg font-black uppercase tracking-tighter">
          Safidio ny soritr'aretina
        </h1>
        <div className="w-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Hikaroka soritr'aretina..."
              className="w-full pl-12 pr-6 py-5 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {category.name}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {category.symptoms.map((s) => {
                  const isSelected = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-gray-50 border-transparent hover:border-blue-200 hover:bg-white"
                      }`}
                    >
                      <span className="font-semibold">{s}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-white border-white" : "border-gray-300"}`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl sticky top-32 border border-blue-50">
            <h3 className="font-black uppercase text-sm text-gray-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Ireo voafidy ({selectedSymptoms.length})
            </h3>
            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {selectedSymptoms.length === 0 ? (
                <p className="text-gray-400 italic text-center py-4">
                  Mbola tsy nisy voafidy...
                </p>
              ) : (
                selectedSymptoms.map((s: string) => (
                  <div
                    key={s}
                    className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm font-bold text-blue-900 group"
                  >
                    {s}
                    <button
                      onClick={() => toggleSymptom(s)}
                      className="text-blue-300 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            {selectedSymptoms.length > 0 && (
              <button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
              >
                HANOHY NY FANADIHADIANA →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANT : TRIAGE RESULTS PAGE ---
function TriageResultsPage({
  symptoms,
  onBack,
}: {
  symptoms: string[];
  onBack: () => void;
}) {
  // Détection automatique de la gravité
  const isEmergency = symptoms.some(
    (s) =>
      s.toLowerCase().includes("rà") ||
      s.toLowerCase().includes("fisefoana") ||
      s.toLowerCase().includes("tratra") ||
      s.toLowerCase().includes("safotra"),
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <header className="text-center mb-16">
        <div
          className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase mb-4 ${isEmergency ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
        >
          {isEmergency ? "Toe-javatra maika" : "Tsy dia mampidi-doza loatra"}
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Vokatry ny fanadihadiana
        </h2>
        <p className="text-gray-500 text-lg">
          Safidio ny dingana manaraka mifanaraka amin'ny fahatsapanao.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Option: Hôpital */}
        <div className="bg-white p-10 rounded-[40px] shadow-lg border-2 border-blue-50 flex flex-col items-center text-center group hover:border-blue-500 transition-all">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black mb-3">Hopitaly akaiky</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Mandeha mivantana any amin'ny tobim-pahasalamana akaiky indrindra
            anao.
          </p>
          <button className="mt-auto w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all">
            Hijery sarintany
          </button>
        </div>

        {/* Option: Ambulance */}
        <div
          className={`p-10 rounded-[40px] shadow-lg border-2 flex flex-col items-center text-center group transition-all ${
            isEmergency
              ? "bg-red-50 border-red-500 animate-[pulse_3s_infinite]"
              : "bg-white border-red-50 hover:border-red-500"
          }`}
        >
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Ambulance
              className={`w-10 h-10 text-red-600 ${isEmergency ? "animate-bounce" : ""}`}
            />
          </div>
          <h3 className="text-2xl font-black mb-3 text-red-900">
            Fiara mpamonjy voina
          </h3>
          <p className="text-red-900/60 mb-8 leading-relaxed">
            Antsoy avy hatrany ny ambulance raha tsy afaka mihetsika ianao.
          </p>
          <button className="mt-auto w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all">
            Hiantso vonjy (124)
          </button>
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-16 block mx-auto text-gray-400 font-bold hover:text-blue-600 transition-colors uppercase text-sm tracking-widest"
      >
        ← Hanova ny soritr'aretina
      </button>
    </div>
  );
}
